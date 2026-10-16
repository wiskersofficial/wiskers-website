"""Pack reviewed transparent cartoon-cat poses into the website's soft atlases.

Source drawings remain in artifacts/cat-motion-proxy-v2. This script only crops,
scales, and packs those approved poses; it does not redraw or infer animation.
"""
from pathlib import Path
import json
import struct
import zlib

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'artifacts/cat-motion-proxy-v2'
OUT = ROOT / 'public/art'
CELL = 362
COLS, ROWS = 4, 3
ATLAS_W, ATLAS_H = CELL * COLS, CELL * ROWS
VIEW_W = VIEW_H = 470
VIEW_LEFT = (CELL - VIEW_W) / 2
ANCHOR_X, ANCHOR_Y = 64, 113
ART_MAX = 300
CELL_FOOT = 330


def paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p-a), abs(p-b), abs(p-c)
    return a if pa <= pb and pa <= pc else b if pb <= pc and pb <= pa else c


def decode_png(path):
    raw = path.read_bytes()
    pos, chunks = 8, []
    width = height = depth = color = interlace = None
    while pos < len(raw):
        length = struct.unpack('>I', raw[pos:pos+4])[0]
        kind, body = raw[pos+4:pos+8], raw[pos+8:pos+8+length]
        pos += length + 12
        if kind == b'IHDR':
            width, height, depth, color, _compression, _filter, interlace = struct.unpack('>IIBBBBB', body)
        elif kind == b'IDAT':
            chunks.append(body)
        elif kind == b'IEND':
            break
    if (depth, color, interlace) != (8, 6, 0):
        raise ValueError(f'Expected non-interlaced RGBA PNG: {path}')
    stride = width * 4
    packed = zlib.decompress(b''.join(chunks))
    pixels = bytearray(width * height * 4)
    offset = 0
    for y in range(height):
        filt = packed[offset]
        offset += 1
        row = packed[offset:offset+stride]
        offset += stride
        base = y * stride
        for x in range(stride):
            a = pixels[base+x-4] if x >= 4 else 0
            b = pixels[base-stride+x] if y else 0
            c = pixels[base-stride+x-4] if y and x >= 4 else 0
            value = row[x]
            if filt == 1:
                value = (value + a) & 255
            elif filt == 2:
                value = (value + b) & 255
            elif filt == 3:
                value = (value + (a+b)//2) & 255
            elif filt == 4:
                value = (value + paeth(a,b,c)) & 255
            elif filt != 0:
                raise ValueError(f'Unsupported PNG filter {filt} in {path}')
            pixels[base+x] = value
    return width, height, pixels


def write_png(path, width, height, pixels):
    def chunk(kind, body):
        return (struct.pack('>I',len(body)) + kind + body +
                struct.pack('>I',zlib.crc32(kind+body)&0xffffffff))
    rows = b''.join(b'\0' + pixels[y*width*4:(y+1)*width*4] for y in range(height))
    data = (b'\x89PNG\r\n\x1a\n' +
            chunk(b'IHDR',struct.pack('>IIBBBBB',width,height,8,6,0,0,0)) +
            chunk(b'IDAT',zlib.compress(rows,9)) + chunk(b'IEND',b''))
    path.write_bytes(data)


SHEET_W, SHEET_H = 1261, 1247
SHEET_CELL_W, SHEET_CELL_H = SHEET_W / 3, SHEET_H / 3


def sheet_pose(index):
    row, col = divmod(index, 3)
    x0, x1 = round(col*SHEET_CELL_W), round((col+1)*SHEET_CELL_W)
    y0, y1 = round(row*SHEET_CELL_H), round((row+1)*SHEET_CELL_H)
    return ('sheet', x0, y0, x1, y1)


def file_pose(name):
    return ('file', name)


# Approved or reviewed poses only. The two repeated holds are intentional:
# the scroll route has more stable IDs than unique key drawings.
IDLE = [sheet_pose(0), sheet_pose(1), sheet_pose(8)]
FALL = [
    sheet_pose(2), file_pose('keyframe-01-lift-off.png'), sheet_pose(3),
    file_pose('keyframe-02-back-first-fall.png'),
    file_pose('pose-05-supine-recreated.png'),
    file_pose('pose-06-righting-recreated.png'),
    file_pose('reference-R7-pose.png'), file_pose('reference-R7-pose.png'),
    file_pose('fall-9-near-contact-v2.png'),
    file_pose('fall-10-first-contact-v2.png'),
    file_pose('reference-R8-pose.png'), file_pose('reference-R9-pose.png'),
]
TRANSITION = [
    file_pose('pose-05-supine-recreated.png'),
    file_pose('pose-05a-half-twist-intermediate.png'),
    file_pose('pose-05a-half-twist-intermediate.png'),
    file_pose('pose-06-righting-recreated.png'),
    file_pose('reference-R7-pose.png'), file_pose('reference-R7-pose.png'),
    file_pose('keyframe-04-impact-compression.png'),
    file_pose('land-2-small-rebound.png'),
    file_pose('land-3-chest-lift-v2.png'),
    file_pose('land-3-chest-lift-v2.png'),
    file_pose('reference-R9-pose.png'), file_pose('reference-R9-pose.png'),
]


def load_pose(spec, cache):
    if spec[0] == 'sheet':
        if 'sheet' not in cache:
            cache['sheet'] = decode_png(SOURCE/'style-proof-soft-9pose-recreated-5-6.png')
        return cache['sheet'], spec[1:]
    name = spec[1]
    if name not in cache:
        cache[name] = decode_png(SOURCE/name)
    width, height, _pixels = cache[name]
    return cache[name], (0,0,width,height)


def crop_bounds(width, height, pixels, region):
    rx0, ry0, rx1, ry1 = region
    min_x, min_y, max_x, max_y = rx1, ry1, rx0-1, ry0-1
    for y in range(ry0,ry1):
        row = y*width*4
        for x in range(rx0,rx1):
            if pixels[row+x*4+3] > 8:
                min_x, min_y = min(min_x,x), min(min_y,y)
                max_x, max_y = max(max_x,x), max(max_y,y)
    if max_x < min_x:
        raise ValueError('Pose crop has no visible pixels')
    return min_x,min_y,max_x+1,max_y+1


def sample_rgba(width, height, pixels, x, y):
    x = min(width-1,max(0.0,x)); y = min(height-1,max(0.0,y))
    x0, y0 = int(x), int(y)
    x1, y1 = min(width-1,x0+1), min(height-1,y0+1)
    fx, fy = x-x0, y-y0
    out_a = [0.0,0.0,0.0,0.0]
    premul = [0.0,0.0,0.0]
    for px, py, weight in ((x0,y0,(1-fx)*(1-fy)),(x1,y0,fx*(1-fy)),
                           (x0,y1,(1-fx)*fy),(x1,y1,fx*fy)):
        i = (py*width+px)*4
        a = pixels[i+3]/255
        out_a[3] += a*weight
        for c in range(3):
            premul[c] += pixels[i+c]*a*weight
    if out_a[3] > 0:
        for c in range(3):
            out_a[c] = round(premul[c]/out_a[3])
    out_a[3] = round(out_a[3]*255)
    return bytes(round(channel) for channel in out_a)


def place_pose(atlas, frame_index, spec, cache):
    (width,height,source), region = load_pose(spec,cache)
    x0,y0,x1,y1 = crop_bounds(width,height,source,region)
    sw,sh = x1-x0,y1-y0
    scale = min(ART_MAX/max(sw,sh), 1.0)
    dw,dh = max(1,round(sw*scale)), max(1,round(sh*scale))
    cell_x,cell_y = (frame_index%COLS)*CELL,(frame_index//COLS)*CELL
    dx0 = cell_x + (CELL-dw)//2
    dy0 = cell_y + CELL_FOOT - dh
    for dy in range(dh):
        sy = y0 + (dy+0.5)/scale - 0.5
        for dx in range(dw):
            sx = x0 + (dx+0.5)/scale - 0.5
            px = sample_rgba(width,height,source,sx,sy)
            dest = ((dy0+dy)*ATLAS_W + dx0+dx)*4
            atlas[dest:dest+4] = px
    return [cell_x,cell_y,CELL,CELL], [
        round(cell_x+VIEW_LEFT,2), round(cell_y+CELL_FOOT-ANCHOR_Y*(VIEW_H/128),2),
        VIEW_W,VIEW_H,
    ]


def build(name, specs, cache):
    image = bytearray(ATLAS_W*ATLAS_H*4)
    rects, boxes = [], []
    for index,spec in enumerate(specs):
        rect, box = place_pose(image,index,spec,cache)
        rects.append(rect); boxes.append(box)
    folder = OUT/f'cat-{name}-soft-v1'
    folder.mkdir(parents=True,exist_ok=True)
    image_name = {'idle':'idle-atlas.png','fall':'fall-atlas.png','transition':'transition-atlas.png'}[name]
    write_png(folder/image_name,ATLAS_W,ATLAS_H,image)
    manifest = {
        'url':f'/art/cat-{name}-soft-v1/{image_name}',
        'width':ATLAS_W,'height':ATLAS_H,
        'viewport':{'width':128,'height':128,'anchorX':ANCHOR_X,'anchorY':ANCHOR_Y},
        'viewBoxes':boxes,'cellRects':rects,
    }
    (folder/'atlas.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(f'{name}: {len(specs)} frames → {folder}')


def main():
    cache = {}
    build('idle',IDLE,cache)
    build('fall',FALL,cache)
    build('transition',TRANSITION,cache)


if __name__ == '__main__':
    main()

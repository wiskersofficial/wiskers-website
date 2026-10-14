"""Normalize Wiskers-owned generated 2x2 animation sheets into sprite strips.

The source images are kept out of the website bundle. They live in the local
Codex generated-images directory and can be regenerated or replaced later.
"""
from pathlib import Path
import struct
import zlib

SOURCE = Path('/Users/lowcostjosh/.codex/generated_images/01a0fbb6-c964-7d43-a5fa-b24a567a2f62')
DEST = Path(__file__).resolve().parents[1] / 'public/assets/wiskers-cat'

SHEETS = {
    # First Wiskers-only set
    'PEEK': 'exec-ad220923-3276-46ba-893c-515268b622f5.png',
    'SLIP': 'exec-2dc74099-3e4e-4499-bee3-07e611e66b52.png',
    'TWIST': 'exec-f5e3ac6d-2174-4894-8c16-4e8a707b3c44.png',
    'RECOVER': 'exec-737e3bb9-81b5-40b1-a4fa-728de416013d.png',
    'LOOKDOWN': 'exec-d76a05d1-810f-4eed-914c-96a9dd3c9ba7.png',
    'REACH': 'exec-877b3bcf-8260-4593-bc79-fe4796c822fa.png',
    'STRETCH': 'exec-03d5488a-20e2-4187-868f-fcd686e070e6.png',
    'CURIOUS': 'exec-72347a6f-f512-42b8-8006-ea817c7bf20c.png',
    # Directional movement, jumps, pawing, and site interactions
    'WALK_FRONT': 'exec-85bd2920-6186-4c7f-ba83-9db10b96ed6d.png',
    'IDLE_FRONT': 'exec-168b385d-4869-4f52-a333-59fb6c1c632f.png',
    'CLIMB': 'exec-fc7a314e-1f06-4083-85b4-08ee12e5c67e.png',
    'SLEEP': 'exec-abcd8d48-4457-4bb2-aa03-2cc202bacccc.png',
    'WALK_BACK': 'exec-57618348-8b3a-4e8e-b51e-54d9d5876f4d.png',
    'WALK_SIDE': 'exec-d329fa10-4704-47cb-8c8b-b85a3ec51d97.png',
    'RUN_SIDE': 'exec-8d8f6f48-fbeb-4701-a31c-178ecbfe9712.png',
    'RUN_FRONT': 'exec-a5f56bc4-d60b-45d5-a74d-c68a83dc3132.png',
    'RUN_BACK': 'exec-6ff29dcc-52dc-49e1-9ea0-06dc6af75c7b.png',
    'JUMP_FRONT': 'exec-a1465ccf-36ea-4ee4-bd49-d3c651d72e91.png',
    'JUMP_SIDE': 'exec-0c99a209-5b57-4186-9309-c351ab2bdc2a.png',
    'POUNCE': 'exec-2b393dd4-9024-468c-a2ef-b1a547d142a4.png',
    'PAW_FRONT': 'exec-31b2da69-bdad-48a1-9966-a7178c652571.png',
    'PAW_SIDE': 'exec-68e360fc-e10d-4e09-8c1b-a906fcea4d15.png',
    'DIAGONAL': 'exec-769dab8e-e8cd-4d72-a0ca-06c700dcfa66.png',
    'EAT': 'exec-abee15e1-ce34-42e7-b034-3481b441c35e.png',
    'LICK': 'exec-0f80b548-8dfa-4f68-b5e1-a8bff31f18df.png',
    'SCARE': 'exec-bfa34fd2-abfd-4945-8bdf-ee3a9cf2642b.png',
    'WAKE': 'exec-bb3ab8ce-3f9d-45f6-837b-bc7fa619bd36.png',
}

def paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p-a), abs(p-b), abs(p-c)
    return a if pa <= pb and pa <= pc else b if pb <= pc else c

def decode(path):
    data = path.read_bytes(); pos = 8; chunks = []
    while pos < len(data):
        n = struct.unpack('>I', data[pos:pos+4])[0]
        typ, body = data[pos+4:pos+8], data[pos+8:pos+8+n]
        pos += n + 12
        if typ == b'IHDR':
            w, h, depth, color, comp, filt, interlace = struct.unpack('>IIBBBBB', body)
        elif typ == b'IDAT': chunks.append(body)
        elif typ == b'IEND': break
    if (depth, color, interlace) != (8, 6, 0):
        raise ValueError(f'Unsupported PNG format in {path.name}')
    stride = w * 4; packed = zlib.decompress(b''.join(chunks)); pixels = bytearray(w*h*4); offset = 0
    for y in range(h):
        filt = packed[offset]; offset += 1; row = packed[offset:offset+stride]; offset += stride; base = y*stride
        for x in range(stride):
            a = pixels[base+x-4] if x >= 4 else 0
            b = pixels[base-stride+x] if y else 0
            c = pixels[base-stride+x-4] if y and x >= 4 else 0
            val = row[x]
            if filt == 1: val = (val+a) & 255
            elif filt == 2: val = (val+b) & 255
            elif filt == 3: val = (val+(a+b)//2) & 255
            elif filt == 4: val = (val+paeth(a,b,c)) & 255
            elif filt != 0: raise ValueError(f'Unsupported PNG filter {filt}')
            pixels[base+x] = val
    return w, h, pixels

def write_png(path, w, h, pixels):
    def chunk(kind, body):
        return struct.pack('>I',len(body)) + kind + body + struct.pack('>I',zlib.crc32(kind+body)&0xffffffff)
    rows = b''.join(b'\0' + pixels[y*w*4:(y+1)*w*4] for y in range(h))
    path.write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0)) + chunk(b'IDAT',zlib.compress(rows,9)) + chunk(b'IEND',b''))

def main():
    DEST.mkdir(parents=True, exist_ok=True)
    for name, filename in SHEETS.items():
        w, h, src = decode(SOURCE / filename)
        cells = []
        # The image generator returns a 2x2 sheet. Crop each quadrant, then
        # fit all four poses to one common silhouette scale and foot anchor.
        for frame in range(4):
            x0, y0 = (frame % 2) * (w//2), (frame//2) * (h//2)
            x1, y1 = ((frame%2)+1)*(w//2), ((frame//2)+1)*(h//2)
            opaque = [(x,y) for y in range(y0,y1) for x in range(x0,x1) if src[(y*w+x)*4+3] > 12]
            if not opaque: raise ValueError(f'Empty frame in {filename}')
            xs, ys = zip(*opaque)
            cells.append((x0,y0,x1,y1,min(xs),min(ys),max(xs)+1,max(ys)+1))
        maxw = max(c[6]-c[4] for c in cells); maxh = max(c[7]-c[5] for c in cells)
        scale = min(29/maxw, 28/maxh)
        out = bytearray(320*64*4)
        for i, (cx0,cy0,cx1,cy1,x0,y0,x1,y1) in enumerate(cells):
            sw, sh = x1-x0, y1-y0; dw, dh = max(1,round(sw*scale)), max(1,round(sh*scale))
            dx0, dy0 = i*80+(80-dw)//2, 48-dh
            for dy in range(dh):
                sy = y0 + min(sh-1, int(dy/scale))
                for dx in range(dw):
                    sx = x0 + min(sw-1, int(dx/scale))
                    si, di = (sy*w+sx)*4, ((dy0+dy)*320+dx0+dx)*4
                    out[di:di+4] = src[si:si+4]
        write_png(DEST / f'{name}.png',320,64,out)
        print(f'{name}: 4 frames, {round(scale,3)}x source')

if __name__ == '__main__': main()

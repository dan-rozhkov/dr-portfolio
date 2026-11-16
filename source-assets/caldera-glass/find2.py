import numpy as np
from PIL import Image
def g(p): return np.asarray(Image.open(p).convert('L'),dtype=np.float32)
for name,rend,side,s0,oy0,ox0 in [('stats-pair','old-mob2.png',(960,1920),.8925,-72,-52),('payment-pair','old-mob3.png',(0,960),.89,-72,-56)]:
    f=g(f'case/{name}-f0.png')[:, side[0]:side[1]]
    r=Image.open(rend).convert('L'); best=None
    for s in np.arange(s0-.004,s0+.004,.0005):
        rr=np.asarray(r.resize((round(1200*s),round(2000*s)),Image.LANCZOS),dtype=np.float32)
        tpl=rr[round(150*s):round(700*s), round(300*s):round(900*s)]; th,tw=tpl.shape
        for oy in range(oy0-6,oy0+7):
            for ox in range(ox0-6,ox0+7):
                y0=round(150*s)+oy; x0=round(300*s)+ox
                e=np.mean(np.abs(f[y0:y0+th,x0:x0+tw]-tpl))
                if best is None or e<best[0]: best=(e,s,oy,ox)
    print(name,best)

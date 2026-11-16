import numpy as np, sys
from PIL import Image
from scipy.ndimage import shift as nshift, zoom
name,v,X0,OY,OX=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),int(sys.argv[5])
S=1.78
f=np.asarray(Image.open(f'case/{name}-f0.png').convert('L'),dtype=np.float32)
O=np.asarray(Image.open(f'old-{v}-btn.png').convert('L'),dtype=np.float32)
B={'mob2':[354.875,153,107.125,36],'mob3':[424,171,40,40]}[v]
m=20
y0=int(B[1]*S)-m;y1=int((B[1]+B[3])*S)+m;x0=int(B[0]*S)-m;x1=int((B[0]+B[2])*S)+m
tgt=f[y0+OY:y1+OY, x0+OX+X0:x1+OX+X0]
best=None
for sc in np.arange(0.994,1.0061,0.002):
  Oz=zoom(O,sc,order=1) if sc!=1 else O
  for dy in np.arange(-1.5,1.51,0.1):
    for dx in np.arange(-1.5,1.51,0.1):
      # scale about the button centre
      cy=(y0+y1)/2; cx=(x0+x1)/2
      sh=nshift(Oz,(dy+cy-cy*sc,dx+cx-cx*sc),order=1,mode='nearest')
      e=np.abs(sh[y0:y1,x0:x1]-tgt).mean()
      if best is None or e<best[0]: best=(e,sc,dy,dx)
print(name,best, 'baseline',np.abs(O[y0:y1,x0:x1]-tgt).mean())

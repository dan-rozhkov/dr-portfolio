import numpy as np, subprocess, json, sys
from PIL import Image
name, v, X0, OY, OX = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
W,H=1920,1200
old=np.asarray(Image.open(f'old-{v}-btn.png').convert('RGB'),dtype=np.float32)
# mask of the old button's visible pixels
dark=(255-old.mean(2))
B={'mob2':[354.875,153,107.125,36],'mob3':[424,171,40,40]}[v]; S=1.78
x0=int(B[0]*S)-6;y0=int(B[1]*S)-6;x1=int((B[0]+B[2])*S)+7;y1=int((B[1]+B[3])*S)+7
tpl=dark[y0:y1,x0:x1]
p=subprocess.Popen(['ffmpeg','-v','error','-i',f'/Users/daniilrozhkov/prj/dr-portfolio/public/images/sber-india-proto/caldera-{name}.mp4','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
res=[];i=0
while True:
    buf=p.stdout.read(W*H*3)
    if len(buf)<W*H*3: break
    f=np.frombuffer(buf,np.uint8).reshape(H,W,3).astype(np.float32)
    fd=255-f.mean(2)
    best=None
    for dy in range(-140,141,1):
        ty=y0+OY+dy; tx=x0+OX+X0
        if ty<0 or ty+tpl.shape[0]>H: continue
        reg=fd[ty:ty+tpl.shape[0], tx:tx+tpl.shape[1]]
        a=float((reg*tpl).sum()/(tpl*tpl).sum())
        rc=reg-reg.mean(); tc=tpl-tpl.mean()
        ncc=float((rc*tc).sum()/(np.sqrt((rc*rc).sum()*(tc*tc).sum())+1e-6))
        if best is None or ncc>best[0]: best=(ncc,dy,a)
    res.append([i,best[1],round(best[2],3),round(best[0],3)]);i+=1
json.dump(res,open(f'track-{name}.json','w'))
for r in res[::15]: print(r)

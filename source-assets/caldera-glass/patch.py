import numpy as np, subprocess, json, sys
from PIL import Image
name, v, X0, OY, OX, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), sys.argv[6]
W,H=1920,1200; S=1.78
O=np.asarray(Image.open(f'old-{v}-btn.png').convert('RGB'),dtype=np.float32)
N=np.asarray(Image.open(f'new-{v}-btn.png').convert('RGB'),dtype=np.float32)
B={'mob2':[352.875,151,109.125,40],'mob3':[424,171,40,40]}[v]
M=70  # device px margin for the shadow
ry0=int(B[1]*S)-M; ry1=int((B[1]+B[3])*S)+M; rx0=int(B[0]*S)-M; rx1=int((B[0]+B[2])*S)+M
D=(N-O)[ry0:ry1, rx0:rx1]
tr=json.load(open(f'track-{name}.json'))
rest=tr[0][2]
alpha=[0.0 if t[3]<0.5 else min(1.0,max(0.0,t[2]/rest)) for t in tr]
# frames at rest (dy 0 and alpha ~1) get exactly 1 so the still frames are identical
alpha=[1.0 if (tr[i][1]==0 and a>0.97) else a for i,a in enumerate(alpha)]
dec=subprocess.Popen(['ffmpeg','-v','error','-i',f'/Users/daniilrozhkov/prj/dr-portfolio/public/images/sber-india-proto/caldera-{name}.mp4','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r','60','-i','-','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-an',out],stdin=subprocess.PIPE)
i=0
while True:
    buf=dec.stdout.read(W*H*3)
    if len(buf)<W*H*3: break
    f=np.frombuffer(buf,np.uint8).reshape(H,W,3).astype(np.float32)
    a=alpha[i]; dy=tr[i][1] if a>0 else 0
    if a>0:
        y0=ry0+OY+dy; x0=rx0+OX+X0
        sy0=max(0,-y0); sy1=D.shape[0]-max(0,y0+D.shape[0]-H)
        sx0=max(0,-x0); sx1=D.shape[1]-max(0,x0+D.shape[1]-(X0+960))
        f[y0+sy0:y0+sy1, x0+sx0:x0+sx1]+=a*D[sy0:sy1,sx0:sx1]
    enc.stdin.write(np.clip(f+0.5,0,255).astype(np.uint8).tobytes()); i+=1
enc.stdin.close(); enc.wait(); print(name,'frames',i)

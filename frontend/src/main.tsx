import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import './style.css'

type V = [number,number,number]
const trees: [number,number][] = [[-6,-5],[-6,1],[6,3],[2,-6]]
const posts: [number,number][] = [[3.3,-5.3],[5.7,-5.3],[3.3,-2.7],[5.7,-2.7]]
function Box({p,s,c,r=[0,0,0]}:{p:V;s:V;c:string;r?:V}) {
 return <mesh position={p} rotation={r} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} flatShading/></mesh>
}
function Garden(){
 return <group>
 <Box p={[0,-0.4,0]} s={[16,0.8,16]} c="#b2a382"/><Box p={[0,0,0]} s={[15.8,0.12,15.8]} c="#a5b78a"/>
 <mesh position={[0,0.07,0]} rotation={[-Math.PI/2,0,0]} scale={[2.7,2.05,1]}><circleGeometry args={[1,24]}/><meshStandardMaterial color="#6aa9a2" roughness={0.3}/></mesh>
 {Array.from({length:24},(_,i)=>{const a=i*Math.PI/12;return <mesh key={i} position={[Math.cos(a)*2.8,0.15,Math.sin(a)*2.15]} scale={[0.36,0.23,0.3]} castShadow><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color={i%2?'#b1b3a2':'#ccc8b4'}/></mesh>})}
 <Box p={[0,0.28,0]} s={[6.5,0.35,1.4]} c="#d3ccb7"/>
 {[-0.68,0.68].map(z=><group key={z}>{[-2.8,-1.4,0,1.4,2.8].map(x=><Box key={x} p={[x,0.63,z]} s={[0.15,0.5,0.15]} c="#c2bca9"/>)}<Box p={[0,0.84,z]} s={[5.8,0.13,0.13]} c="#d8d0bd"/></group>)}
 {Array.from({length:11},(_,i)=><mesh key={i} position={[Math.sin(i*0.7)*0.6,0.08,2.8+i*0.42]} rotation={[-Math.PI/2,0,i]}><circleGeometry args={[0.4,6]}/><meshStandardMaterial color="#d6cfb9"/></mesh>)}
 {trees.map(([x,z],i)=><group key={i} position={[x,0,z]}><Box p={[0,1,0]} s={[0.3,2,0.3]} c="#80664b" r={[0,0,-0.13]}/>{[-1,0,1].map((n)=><mesh key={n} position={[n*0.45,2.3+n*0.4,0]} scale={[1.1,0.45,0.95]} castShadow><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color={n===0?'#79905d':'#65815e'} flatShading/></mesh>)}</group>)}
 <Box p={[4.5,0.15,-4]} s={[3.4,0.3,3.4]} c="#bfb7a4"/><Box p={[4.5,0.36,-4]} s={[3,0.13,3]} c="#9b7959"/>
 {posts.map(([x,z],i)=><Box key={i} p={[x,1.5,z]} s={[0.22,2.3,0.22]} c="#955f49"/>)}
 <Box p={[4.5,2.5,-4]} s={[3.1,0.25,3.1]} c="#52796c"/>
 {[-1,1].map(side=><group key={side}><Box p={[4.5+side*0.85,2.95,-4]} s={[2.1,0.18,3.8]} c="#535d60" r={[0,0,-side*0.37]}/><Box p={[4.5+side*1.8,2.7,-4]} s={[0.35,0.16,3.9]} c="#697476" r={[0,0,side*0.2]}/>{Array.from({length:13},(_,i)=><Box key={i} p={[4.5+side*0.85,3.06,-5.8+i*0.3]} s={[2.12,0.07,0.065]} c="#828984" r={[0,0,-side*0.37]}/>)}</group>)}
 <Box p={[4.5,3.4,-4]} s={[0.2,0.2,4]} c="#979a8c"/><Box p={[4.5,0.55,-2.1]} s={[1.5,0.25,0.6]} c="#c7beaa"/>
 {Array.from({length:8},(_,i)=><group key={i} position={[-3.7+i*0.35,0,-6]}><Box p={[0,1.25,0]} s={[0.1,2.5+(i%3)*0.2,0.1]} c="#70955e"/>{[1.2,1.8,2.4].map(y=><Box key={y} p={[0.15,y,0]} s={[0.6,0.08,0.18]} c="#91ab71" r={[0,0,0.3]}/>)}</group>)}
 {[-7.65,7.65].map(x=><group key={x}><Box p={[x,0.45,0]} s={[0.3,0.8,15.6]} c="#bdb9a5"/><Box p={[x,0.91,0]} s={[0.45,0.16,15.8]} c="#68716b"/></group>)}
 <Box p={[0,0.45,-7.65]} s={[15.6,0.8,0.3]} c="#bdb9a5"/><Box p={[0,0.91,-7.65]} s={[15.8,0.16,0.45]} c="#68716b"/>
 {[-1,1].map(side=><group key={side}><Box p={[side*4.55,0.45,7.65]} s={[6.2,0.8,0.3]} c="#bdb9a5"/><Box p={[side*4.55,0.91,7.65]} s={[6.3,0.16,0.45]} c="#68716b"/><Box p={[side*1.3,1.1,7.5]} s={[0.25,2.2,0.25]} c="#91664b"/><Box p={[side*0.7,2.3,7.5]} s={[1.8,0.18,1]} c="#5b6668" r={[0,0,-side*0.25]}/></group>)}
 <Box p={[-4.5,0.5,4]} s={[1.8,0.18,0.65]} c="#997454"/>{[-5.2,-3.8].map(x=><Box key={x} p={[x,0.23,4]} s={[0.16,0.5,0.5]} c="#785d46"/>)}
 {Array.from({length:40},(_,i)=>{const x=(i%10)*0.32-5.8,z=Math.floor(i/10)*0.32-2.8;return <group key={i}><Box p={[x,0.2,z]} s={[0.04,0.3,0.04]} c="#6e8a54"/><mesh position={[x,0.39,z]}><icosahedronGeometry args={[0.14,0]}/><meshStandardMaterial color={['#dfb8b0','#f2e3bd','#e6c66f'][i%3]}/></mesh></group>})}
 </group>
}
function blocked(x:number,z:number){
 if(Math.abs(x)>7||Math.abs(z)>7)return true
 if((x/3.15)**2+(z/2.55)**2<1&&Math.abs(z)>0.4)return true
 if(trees.some(([a,b])=>Math.hypot(x-a,z-b)<0.85))return true
 if(posts.some(([a,b])=>Math.hypot(x-a,z-b)<0.45))return true
 return x>-5.7&&x<-3.3&&z>3.4&&z<4.6
}
function Player({third,name,color}:{third:boolean;name:string;color:string}){
 const root=useRef<THREE.Group>(null), body=useRef<THREE.Group>(null)
 const keys=useRef(new Set<string>()), pos=useRef(new THREE.Vector3(0,0,5.5)), angle=useRef(Math.PI)
 const desired=useRef(new THREE.Vector3()),target=useRef(new THREE.Vector3()),ready=useRef(false),walk=useRef(0)
 useEffect(()=>{
 const down=(e:KeyboardEvent)=>{if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.current.add(e.code)}}
 const up=(e:KeyboardEvent)=>{keys.current.delete(e.code)},clear=()=>keys.current.clear()
 window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear)
 return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear)}
 },[])
 useFrame(({camera},dt)=>{
 const k=keys.current,dx=Number(k.has('KeyD')||k.has('ArrowRight'))-Number(k.has('KeyA')||k.has('ArrowLeft')),dz=Number(k.has('KeyS')||k.has('ArrowDown'))-Number(k.has('KeyW')||k.has('ArrowUp')),len=Math.hypot(dx,dz),p=pos.current
 if(len){const step=3*Math.min(dt,0.05)/len;if(!blocked(p.x+dx*step,p.z))p.x+=dx*step;if(!blocked(p.x,p.z+dz*step))p.z+=dz*step;angle.current=Math.atan2(dx,dz);walk.current+=dt*10}
 p.y=Math.abs(p.x)<3.3&&Math.abs(p.z)<0.65?0.46:(p.x>3&&p.x<6&&p.z>-5.6&&p.z<-2.4?0.43:0.07)
 root.current?.position.copy(p)
 if(body.current){body.current.rotation.y=angle.current;body.current.position.y=len?Math.sin(walk.current)*0.04:0}
 target.current.set(p.x,p.y+0.9,p.z)
 if(third)desired.current.set(p.x-Math.sin(angle.current)*5,p.y+3.5,p.z-Math.cos(angle.current)*5)
 else desired.current.set(p.x+10,p.y+13,p.z+12)
 if(!ready.current){camera.position.copy(desired.current);ready.current=true}else camera.position.lerp(desired.current,1-Math.exp(-dt*5))
 camera.lookAt(target.current)
 })
 return <group ref={root} position={[0,0,5.5]}><Html position={[0,1.95,0]} center style={{pointerEvents:'none'}}><span className="nameplate">{name}</span></Html><group ref={body}>
 <mesh position={[0,0.55,0]} castShadow><cylinderGeometry args={[0.24,0.42,0.7,8]}/><meshStandardMaterial color={color}/></mesh>
 <Box p={[0,0.88,0.1]} s={[0.46,0.2,0.32]} c="#f4e9d3"/><Box p={[0.04,0.83,0.29]} s={[0.06,0.3,0.03]} c="#e9d7b5" r={[0,0,-0.4]}/>
 <mesh position={[0,1.22,0]} castShadow><sphereGeometry args={[0.33,12,10]}/><meshStandardMaterial color="#efcfad"/></mesh>
 <mesh position={[0,1.39,-0.05]} castShadow><sphereGeometry args={[0.32,12,8]}/><meshStandardMaterial color="#494438"/></mesh>
 <mesh position={[0,1.69,-0.09]}><sphereGeometry args={[0.12,8,6]}/><meshStandardMaterial color="#494438"/></mesh>
 {[-1,1].map(s=><group key={s}><mesh position={[s*0.105,1.23,0.3]}><sphereGeometry args={[0.028,8,6]}/><meshStandardMaterial color="#393d35"/></mesh><Box p={[s*0.32,0.74,0]} s={[0.2,0.4,0.23]} c="#f4e9d3" r={[0,0,s*0.25]}/><Box p={[s*0.15,0.1,0.04]} s={[0.22,0.15,0.3]} c="#594d40"/></group>)}
 </group></group>
}
function App(){
 const [third,setThird]=useState(false)
 const [identity]=useState(()=>({name:['느긋한','산책하는','졸린','다정한'][Math.floor(Math.random()*4)]+' '+['솔잎','참새','달빛','새싹'][Math.floor(Math.random()*4)],color:['#729d92','#b58e9a','#90a274','#7799b0'][Math.floor(Math.random()*4)]}))
 useEffect(()=>{const toggle=(e:KeyboardEvent)=>{if(e.code==='KeyC'&&!e.repeat)setThird(v=>!v)};window.addEventListener('keydown',toggle);return()=>window.removeEventListener('keydown',toggle)},[])
 return <main><header><div><span className="eyebrow">META GARDEN · 함께 쉬어가는 곳</span><h1>느긋한 정원 <small>庭</small></h1><p>돌길을 따라 걷고, 잠시 마음을 쉬어가세요.</p></div><div className="visitor"><i style={{background:identity.color}}/>{identity.name}<span>혼자 둘러보는 중</span></div></header>
 <section className="garden" aria-label="한국 전통 정원. WASD 또는 방향키로 이동, C 키로 시점 전환"><div className="scene-label"><span>첫 번째 마당</span><strong>소담한 연못 정원</strong></div>
 <Canvas shadows camera={{position:[10,13,17],fov:45,near:0.1,far:100}} dpr={[1,1.5]}><color attach="background" args={['#e9e9db']}/><fog attach="fog" args={['#e9e9db',30,65]}/><ambientLight intensity={1.5}/><hemisphereLight args={['#fff5df','#798969',1]}/><directionalLight position={[-8,15,8]} intensity={2.2} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-13} shadow-camera-right={13} shadow-camera-top={13} shadow-camera-bottom={-13} shadow-normalBias={0.04}/><Garden/><Player third={third} name={identity.name} color={identity.color}/></Canvas>
 <button className="camera" onClick={()=>setThird(v=>!v)} aria-label="카메라 시점 전환">{third?'3인칭':'쿼터뷰'} <span>시점 바꾸기 · C</span></button></section>
 <footer><div><b>W A S D</b> / 방향키로 걷기 <span>·</span> <b>C</b> 시점 전환</div><span>연못은 돌다리를 따라 건너보세요.</span></footer></main>
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)

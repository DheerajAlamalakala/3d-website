uniform float uTime;
uniform vec3 uPointer;
uniform float uPointerStr;
uniform float uScroll;
uniform float uPixelRatio;
attribute float aSeed;
attribute float aSize;
varying float vAlpha;
varying float vMix;
float noise(vec3 p){return sin(p.x*1.7+sin(p.y*1.3+p.z)+uTime*.3)*sin(p.z*1.5+p.y*.7-uTime*.2);}
void main(){
 vec3 pos=position;
 float t=uTime*.15;
 vec3 flow=vec3(noise(pos+vec3(t,aSeed,0.)),noise(pos+vec3(31.7,t,aSeed)),noise(pos+vec3(17.3,5.1,t)));
 pos+=flow*(.35+.25*aSeed);
 float a=uTime*.06; pos.xz=mat2(cos(a),-sin(a),sin(a),cos(a))*pos.xz;
 float s=smoothstep(0.,1.,uScroll); pos*=1.+s*(.8+aSeed*1.6);
 float twist=s*2.5; pos.xy=mat2(cos(twist),-sin(twist),sin(twist),cos(twist))*pos.xy;
 vec3 away=pos-uPointer; float influence=exp(-dot(away,away)*.9)*uPointerStr;
 pos+=normalize(away+vec3(.0001))*influence*1.1;
 vec4 mv=modelViewMatrix*vec4(pos,1.); gl_Position=projectionMatrix*mv;
 gl_PointSize=aSize*uPixelRatio*(38./-mv.z)*(1.+influence*1.5);
 vMix=clamp(.5+.5*flow.x+influence,0.,1.); vAlpha=(.35+.65*aSeed)*(.55+influence);
}
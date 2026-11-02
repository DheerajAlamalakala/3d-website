uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vAlpha;
varying float vMix;
void main(){
 float d=length(gl_PointCoord-.5); if(d>.5)discard;
 float glow=pow(1.-smoothstep(0.,.5,d),1.8);
 vec3 color=mix(uColorA,uColorB,vMix);
 gl_FragColor=vec4(color,glow*vAlpha);
}
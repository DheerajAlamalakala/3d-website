import Lenis from "lenis";
export default class Scroll {
  constructor(){this.progress=0;this.smooth=0;this.lenis=new Lenis({lerp:.085,wheelMultiplier:.9});this.lenis.on("scroll",({progress})=>this.progress=progress||0);}
  update(time,delta){this.lenis.raf(time*1000);this.smooth+=(this.progress-this.smooth)*(1-Math.exp(-4*delta));}
  dispose(){this.lenis.destroy();}
}
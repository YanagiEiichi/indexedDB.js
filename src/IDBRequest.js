  define("Request",function(){
    this.readyState="pending",this.result=null;
    this._resolve=function(result){
      this.result=result,this.readyState="done";
      this.dispatchEvent({type:"success",target:this});
    };
    this._reject=function(result){
      this.result=result,this.readyState="done";
      this.dispatchEvent({type:"error",target:this});
    };
  },new EventTarget);

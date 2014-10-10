  var Compare=function(){
    var f,m={undefined:0,number:1,string:2,object:3};
    return f=function(a,b){
      var i,r;
      if(a===null)a=void 0;
      if(b===null)b=void 0;
      if(r=m[typeof a]-m[typeof b])return r;
      if(typeof a!="object")return a<b?-1:a==b?0:1;
      for(i=0;i<a.length||i<b.length;i++)
        if(r=f(a[i],b[i]))return r;
      return 0;
    };
  }();

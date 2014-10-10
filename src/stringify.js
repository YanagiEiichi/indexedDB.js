  var stringify=function(){
    var ESCAPE={8:"b",9:"t",10:"n",12:"f",13:"r",34:'"',92:"\\"};
    var ObjectToString=Object.prototype.toString,stack=[];
    return function(e){
      if(e===void 0)return "void 0";
      if(e===null)return "null";
      var type=typeof e;
      if(type=="object"){
        for(i=0;i<stack.length;i++)
          if(stack[i]==e)throw new Error("self-reference");
        type=ObjectToString.call(e);
      };
      switch(type){
        case "[object Number]":e*=1;
        case "number":
          switch(true){
            case e==1/0:return "1/0";
            case e==-1/0:return "-1/0";
            case e!=e:return "0/0";
            case 1/e==-1/0:return "-0";
            default:return e+"";
          };
        case "[object String]":e+="";
        case "string":
          return '"'+e.replace(/[\x00-\x19\x22\x5C]/g,function(c){
            c=c.charCodeAt(0)
            return "\\"+(ESCAPE[c]||"x"+(c<16?"0":"")+c.toString(16));
          })+'"';    
        case "[object Boolean]":e=e*1;
        case "boolean":return e?"true":"false";
        case "[object Date]":
          return "new Date("+e*1+")";
        case "[object Object]":
          var i,s=[];
          stack.push(e);
          try{for(i in e)s.push(stringify(i)+":"+stringify(e[i]));}
          finally{stack.pop();};
          return "{"+s+"}";
        case "[object Arguments]":
        case "[object Array]":
          var i,s=[];
          stack.push(e);
          try{for(i=0;i<e.length;i++)s.push(stringify(e[i]));}
          finally{stack.pop();};
          return "["+s+"]";
        default:throw new Error("Stringify Error");
      };
    };
  }();

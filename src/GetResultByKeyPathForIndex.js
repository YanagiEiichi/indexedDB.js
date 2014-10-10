  function GetResultByKeyPathForIndex(keyPath,row){
    var result,i,key,value;
    if(keyPath instanceof Array){
      for(i=0,result=[];i<keyPath.length;i++){
        key=keyPath[i],value=row[key];
        if(!key||value==null||typeof value=="object")
          return void 0;
        result.push(value);
      };
      return result;
    }else if(keyPath){
      result=row[keyPath];
      if(result==null||typeof result=="object")return void 0;
      return result;
    }else return void 0;
  };

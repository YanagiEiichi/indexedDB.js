  var DOMStringList=function(array){
    return array.contains=function(value){
      for(var i=0;i<array.length;i++)
        if(array[i]==value)return true;
      return false;
    },array.item=function(index){
      return array[index];
    },array;
  };

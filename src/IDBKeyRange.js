  define("KeyRange",function(lower,upper,lowerOpen,upperOpen){
    if(lower!=null&&upper!=null&&Compare(lower,upper)>0)
      throw new Error("The lower key is greater than the upper key.");
    this.lower=lower;
    this.upper=upper;
    this.lowerOpen=lowerOpen;
    this.upperOpen=upperOpen;
    this._match=function(key){
      var r;
      if(lower!==void 0){
        r=Compare(key,lower);
        if(r<0||r==0&&lowerOpen)return false;
      };
      if(upper!==void 0){
        r=Compare(upper,key);
        if(r<0||r==0&&upperOpen)return false;
      };
      return true;
    };
  },{});
  IDBKeyRange.only=function(e){
    AssertValidKey(e);
    return new IDB.KeyRange(e,e);
  };
  IDBKeyRange.lowerBound=function(l,lo){
    AssertValidKey(l);
    return new IDB.KeyRange(l,void 0,!!lo,false);
  };
  IDBKeyRange.upperBound=function(u,uo){
    AssertValidKey(u);
    return new IDB.KeyRange(void 0,u,false,!!uo);
  };
  IDBKeyRange.bound=function(l,u,lo,uo){
    AssertValidKey(l);
    AssertValidKey(u);
    if(l==u&&(lo||uo))
      throw Error("The lower key and upper key are equal and one of the bounds is open.");
    return new IDB.KeyRange(l,u,!!lo,!!uo);
  };

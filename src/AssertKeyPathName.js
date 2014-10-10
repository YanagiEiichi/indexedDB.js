  function AssertKeyPathName(key){
    if(!/^(?!\d)[\w$]*$/.test(key))
      throw new Error("The keyPath argument contains an invalid key path.");
  };

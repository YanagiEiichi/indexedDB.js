<?
header('Content-Type: text/javascript');
ob_start();
require 'header.txt';
?>

var IDBFactory,IDBRequest,IDBOpenDBRequest,
    IDBTransaction,IDBObjectStore,IDBKeyRange,
    IDBIndex,IDBDatabase,IDBCursorWithValue,
    IDBVersionChangeEvent,indexedDB;

indexedDB=indexedDB||(function(){
  var IDB={},prefix="indexedDB";
  function define(name,func,proto){
    function err(){throw new TypeError("Illegal constructor");};
    self["IDB"+name]=err,IDB[name]=func;
    err.prototype=func.prototype=proto;
  };
<?
require 'stringify.js';
require 'parse.js';
require 'AssertKeyPathName.js';
require 'AssertValidKey.js';
require 'NormalizeKeyPath.js';
require 'GetResultByKeyPathForIndex.js';
require 'Compare.js';
require 'DOMStringList.js';
require 'EventTarget.js';
require 'IDBFactory.js';
require 'IDBRequest.js';
require 'IDBOpenDBRequest.js';
require 'IDBDataBase.js';
require 'IDBTransaction.js';
require 'IDBObjectStore.js';
require 'IDBCursorWithValue.js';
require 'IDBKeyRange.js';
require 'IDBIndex.js';
?>
  //Initialize instance
  return new IDB.Factory;
})();

if(window.define&&define.amd)define(indexedDB);
<?
$data=ob_get_contents();
$data=str_replace("\xEF\xBB\xBF",'',$data);
file_put_contents('../indexedDB.js',$data);
ob_end_clean();
die($data);
?>
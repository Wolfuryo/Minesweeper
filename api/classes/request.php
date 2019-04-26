<?php
/*
Handling request types(post, get etc.), validating data
*/
class request{
/*
Check if the $_POST variable has been populated
*/
public function post(){
return count($_POST)!==0;
}
/*Check if the $_GET variable has been populated
*/
public function get(){
return count($_GET)!==0;
}

/*
Check if $_GET contains the given variables
*/
public function are_set($vars){
$q=1;
foreach($vars as $var){
if(empty($_GET[$var])){
$q=0;
}
}
return $q;
}
}
?>

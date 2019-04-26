<?php
/*
Class handling SQL queries
*/
class db{

/*
The pdo instance
*/
private $db;

/*
Construct function:sets class variables
    $db:the pdo instance
*/
function __construct($db){
$this->db=$db;
}

/*
Execute a query
    string $q:the query
    array $val:values in $q
*/
public function query($q, $val=array()){
$query=$this->db->prepare($q);
$query->execute($val);
return $query;
}

/*
Returns a pdo instance for custom queries
*/
public function get(){
return $this->db;
}
}
?>

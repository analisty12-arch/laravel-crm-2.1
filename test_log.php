<?php
$log = file_get_contents('c:\Users\osdennis\Documents\GitHub\laravel-crm-2.1\storage\logs\laravel.log');
$errors = explode('[202', $log);
$last = '[202' . end($errors);
echo substr($last, 0, 1500);

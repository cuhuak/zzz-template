$${IF(data.name, '### $${data.name} (see [$${data.dir}]($${data.dir}))', data)}
$${INCLUDE('_src.' + data.type + '.md', data)}

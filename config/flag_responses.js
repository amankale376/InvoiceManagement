

const flags = (custom , code , req ,res) =>{
if(custom){
res.status(400).send(custom)
}
if(code){
switch (code){
    case 401:{
        res.status(401).send('Authorization Failed')
        break;
    } 
    case 403:{
        res.status(403).send('Forbidden')
        break;
    }
    case 404:{
        res.status(404).send('Resource not found')
        break;
    }
    default:{
      
    }
}
}
}

module.exports = flags
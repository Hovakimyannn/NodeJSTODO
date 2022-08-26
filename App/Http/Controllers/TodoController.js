const fs = require('fs');
const path = require('path');
const uid = require('uuid');
const fullPath = path.resolve('storage', 'todos.json');

module.exports = {
    create, read, update, remove, getAll
};

function create(req) {
    const id = uid.v1();
    let todo =
        {
            id: id,
            todo: req.body.todo,
            status: false
        }

    logicForWrite(todo);

    return todo;
}

function read(req) {
    const id = req.params.id
    let result = search(id);

    if (!result) {
        result.id = id;
    }

    return result;
}

function getAll() {
    return search();
}

function update(req) {
    let id = req.body.id;
    let result = search(id);
    if (Object.keys(result).length === 0) {
        return result;
    }

    result.todo = req.body.todo !== undefined ? req.body.todo : result.todo;
    result.status = req.body.status !== undefined ?
        (
            result.status !== true
        ) :
        result.status;

    let todo =
        {
            id: id,
            todo: result.todo,
            status: result.status
        }
    logicForWrite(todo);

    return todo;
}

function remove(req) {
    let id = req.params.id;
    let result = search();
    let initial = result.map((x) => x);

    if (!result) {
        return result;
    }

    let elem = result.find(elem => elem.id === id);

    if (elem) {
        let findElemIndex = result.indexOf(elem);
        result.splice(findElemIndex, 1);
    }
    writeFile(result);

    return {
        'status_code': initial.length !== result.length
    };
}

function logicForWrite(todo) {
    fs.promises.readFile(fullPath, 'utf8').then(text => {
        let obj = todo;

        if (text.length <= 2) {
            obj = [todo];
        } else if (JSON.parse(text).length >= 1) {
            obj = JSON.parse(text);
            let elem = obj.find(elem => elem.id === todo.id);

            if (elem) {
                let findElemIndex = obj.indexOf(elem);
                obj.splice(findElemIndex, 1, todo);
            } else {
                obj.push(todo);
            }
        }
        writeFile(obj);
    });
}

function writeFile(obj) {
    const data = JSON.stringify(obj, null, 2);
    fs.writeFile(fullPath, data, 'utf8', err => {
        if (err) {
            console.error(err + 'err');
        }
    })
}

function search(id = null) {
    const data = fs.readFileSync(fullPath,
        {encoding: 'utf8', flag: 'r'});

    if (!data) {

        return {};
    }
    let array = JSON.parse(data);
    if (!id) {

        return array;
    }

    let obj = array.find(item => item.id === id);
    if (!obj) {

        return {};
    }

    if (Object.keys(obj).length === 0) {

        return {};
    }

    return obj;
}


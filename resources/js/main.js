window.onload = function () {
    getAll();
    document.body.innerHTML = `<body>
<div class="container">
    <div id="newtask">
        <label>
            <input type="text" placeholder="Task " id="input_task">
        </label>
        <button id="push"><i class="fas fa-paper-plane"></i></button>
    </div>
    <div id="tasks"></div>
</div>
</body>`
    document.querySelector("#push").addEventListener("click", createTask);
    document.addEventListener("keydown", function (e) {
        if (e.code === "Enter") {
            createTask();
        }
    });
}
const token = document.head.querySelector('meta[name="csrf-token"]').content;

function deleteTask(delete_task) {
    let current_id = delete_task.querySelector("#task_id").textContent;
    let div = document.querySelector("#delete" + current_id).parentNode.parentNode;

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let data = JSON.parse(xhr.responseText);
            if (data["status_code"]) {
                div.remove();
            }
        }
    }
    xhr.open("DELETE", "http://localhost:3333/remove/" + current_id, true);
    xhr.send();
}

function createTask() {
    let task = document.querySelector("#input_task").value;
    if (task) {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let data = xhr.responseText;
                data = JSON.parse(data);
                displayTask(data.id, task, 0);
            }
        }
        xhr.open("POST", "http://localhost:3333/create", true);
        xhr.setRequestHeader('Accept', "application/json");
        xhr.setRequestHeader('Content-Type', "application/json");
        xhr.send('{"todo":"' + task + '"}');
        document.querySelector("#input_task").value = "";
    }
}

function getAll() {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let data = xhr.responseText;
            data = JSON.parse(data);
            for (let item in data) {
                displayTask(data[item]["id"], data[item]["todo"], data[item]["status"]);
            }
        }
    }
    xhr.open("GET", "http://localhost:3333/get", true);
    xhr.setRequestHeader('Accept', "application/json");
    xhr.setRequestHeader('Content-Type', "application/json");
    xhr.send();
}

function updateState(btn) {
    let current_id = btn.querySelector("#task_id").innerHTML;
    let taskTxt = document.querySelector("#taskname" + current_id);
    let done_button = document.querySelector("#done" + current_id);
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let data = JSON.parse(xhr.responseText);
            if (data.status === true) {
                taskTxt.classList.add("done");
                done_button.classList.add("done_button_on");
            } else {
                taskTxt.classList.remove("done");
                done_button.classList.remove("done_button_on");
            }
        }
    }
    xhr.open("PUT", "http://localhost:3333/edit", true);
    xhr.setRequestHeader('Accept', "application/json");
    xhr.setRequestHeader('Content-Type', "application/json");
    xhr.send('{"id":"' + current_id + '","status":true' + '}');
}

function displayTask(id, task, status) {
    let str = `
        <div>
         <div class="task" id="dblclick${id}">
            <span style="visibility: hidden" id="task_id" style="">${id}</span>
            <div id="taskname${id}"`;
    status ? str += `class="done"` : str += 'class=""';
    str += `>${task}</div>
                        <div class="btns">
                            <button id="done${id}" class="done_button`;
    status ? str += ` done_button_on` : null;
    str += `"> <i class="fas fa-check"></i>
                            </button>
                            <button class="delete" id="delete${id}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    </div>
    `;
    document.querySelector('#tasks').innerHTML += str;
    addListeners();
}

function addListeners() {
    let tasks = document.querySelectorAll(".task");
    let delete_buttons = document.querySelectorAll(".delete");
    let done_buttons = document.querySelectorAll(".done_button");
    for (let i = 0; i < tasks.length; i++) {
        let txt = tasks[i].querySelector(`span + div`)
        txt.addEventListener("dblclick", function (e) {
            e.preventDefault();
            updateTask(tasks[i]);
        });
        delete_buttons[i].addEventListener("click", function (e) {
            e.preventDefault();
            deleteTask(tasks[i]);
        });
        done_buttons[i].addEventListener("click", function (e) {
            e.preventDefault();
            updateState(tasks[i]);
        });
    }
}

function updateTask(task_div) {
    let id = task_div.querySelector("#task_id").textContent;
    let parent = document.querySelector("#dblclick" + id).parentNode;
    let rollback = parent.innerHTML;
    let content = task_div.querySelector("#taskname" + id).textContent;
    let if_done = task_div.querySelector("#taskname" + id).classList.length;
    parent.innerHTML = `
                <div id="edit_div" class="edit_task">
                    <label>
                        <input class="input_edit_task${id}" style="z-index: 15;" type="text" placeholder="Task " id="input_edit_task" value="${content}">
                    </label>
                    <button id="push" class="edit_push${id} edit-button-content"><i class="fas fa-edit" ></i></button>
                </div>
            `;
    let edit_id = ".edit_push" + id;
    let push_element = parent.querySelector(edit_id);
    push_element.addEventListener('click', function (e) {
        e.preventDefault();
        let edited_task = parent.querySelector(`.input_edit_task${id}`).value;
        if (edited_task === content) {
            parent.innerHTML = rollback;
            addListenersForUpdated(parent, id);
        } else {
            content = edited_task;
            parent.innerHTML = `
                                 <div class="task" id="dblclick${id}">
                                    <span style="visibility: hidden" id="task_id" style="">${id}</span>
                                    <div id="taskname${id}"${if_done ? 'class="done"' : ''}>${content}</div>
                                    <div class="btns">
                            <button id="done${id}" class="done_button ${if_done ? 'done_button_on' : null}">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="delete" id="delete${id}">
                                <i class="fas fa-times"></i>
                            </button>
                                    </div>
    `;
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let data = JSON.parse(xhr.responseText);
                    if (data["status_code"] === 200) {
                        addListenersForUpdated(parent, id);
                    } else if (data["status_code"] === 400) {
                        alert('incorrect data');
                    } else if (data["status_code"] === 204) {
                        deleteTask(task_div);
                    }
                }
            }
            xhr.open("PUT", "http://localhost:3333/edit", true);
            xhr.setRequestHeader('Accept', "application/json");
            xhr.setRequestHeader('Content-Type', "application/json");
            xhr.send('{"id":"' + id + '","todo":"' + content + '"}');
        }
    })
}

function addListenersForUpdated(parent, id) {
    document.querySelector("#dblclick" + id).addEventListener("dblclick", function (e) {
        e.preventDefault();
        updateTask(parent);
    });
    document.querySelector("#done" + id).addEventListener("click", function (e) {
        e.preventDefault();
        updateState(parent);
    });
    document.querySelector("#delete" + id).addEventListener("click", function (e) {
        e.preventDefault();
        deleteTask(parent);
    });
}




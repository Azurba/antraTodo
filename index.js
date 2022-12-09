//design pattern
//readable, maintainable, debuggable
//MVC/MVVM, model(data) view(element) controller(eventlistener, logic), model view viewmodel
//template(html), controller(javascript),css(), DOM api(window.document),

//closure, IIFE(immediately invoked function expression)

/* const model = (() => {
    let counter = 0;
    const increment = () => {
        counter++
        return counter
    };
    return {
        increment,
    };
})();
console.log(model.increment());
console.log(model.increment()); */

//table, rows, columns, id(uuid(universally unique identifier), uid)

/* 
    get(id optionally): read
    post: write
    put(id): update, replace
    patch(id): update, partial replace
    delete(id): remove a row
*/

//this is getting all the data from the server
const APIs = (() => {
    const URL = "http://localhost:3000/todos";

    const addTodo = (newTodo) => {
        // post
        return fetch(URL, {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    };

    const removeTodo = (id) => {
        return fetch(URL + `/${id}`, {
            method: "DELETE",
        }).then((res) => res.json());
    };

    //get the first data from the server - when user first comes to site
    const getTodos = () => {
        return fetch(URL).then((res) => res.json());
    };
    return {
        addTodo,
        removeTodo,
        getTodos,
    };
})();

const Model = (() => {
    //todolist
    class State {
        #todos; //[{id: ,title: },{}]
        #onChange; //this is the new data that will update the old
        constructor() {
            this.#todos = [];
        }

        get todos() {
            return this.#todos;
        }

        set todos(newTodo) {
            console.log("setter");
            this.#todos = newTodo;
            //const obj = {name:"adam"}; 
            //obj.age //undefined 
            //obj.age(); //error
            this.#onChange?.();
        }

        //whenever the data is updated, we want to update the website as well
        subscribe(callback) {
            this.#onChange = callback;
        }
    }
    let { getTodos, removeTodo, addTodo } = APIs;

    return {
        State,
        getTodos,
        removeTodo,
        addTodo,
    };
})();
//BEM, block element modifier methodology
//it is a block of code that maintain all the element that we are going
//to be using in this application
const View = (() => {
    const formEl = document.querySelector(".form"); //querying
    const todoListEl = document.querySelector(".todo-list");

    const updateTodoList = (todos) => {
        let template = "";
        //for each element in the array (todos)
        //for each element (object) we have id and title 
        todos.forEach((todo) => {
            //for each todo, I want to create a html row for that todo
            const todoTemplate = `<li><span>${todo.title}</span><button class="btn--delete" id="${todo.id}">remove</button></li>`;
            template += todoTemplate;
        });
        if(todos.length === 0){
            template = "no task to display"
        }
        //attach the template (todo list) inside the html list element
        todoListEl.innerHTML = template;
    };

    return {
        formEl,
        todoListEl,
        updateTodoList,
    };
})();

//reference: pointer
//window.console.log

//

/* 
    prevent the refresh
    get the value from input
    save the new task to the database(could fail)
    save new task object to state, update the page
    
*/

//this will "consume" and use the Model and View
//this is the boss and the Model and View are the slaves
//This is the controller
const ViewModel = ((View, Model) => {
    console.log("model", Model);
    const state = new Model.State(); //instantiate the Model

    //this function will get the todos from the getTodos function from Model
    const getTodos = () => {
        Model.getTodos().then((res) => {
            state.todos = res; //save the data in the State obj
        });
    };

    const addTodo = () => {
        //when you click the submit button, take the event
        View.formEl.addEventListener("submit", (event) => {
            event.preventDefault(); //prevent the page to refresh

            //get the value being typed in the form. Target returns an array
            //we only have one thing (the text) so the index is [0]
            const title = event.target[0].value;
            //check if the text is empty or not. 
            if(title.trim() === "") {
                alert("please input title!");
                return;
            }
            console.log("title", title);
            //Model.addTodo takes an argument: an object
            //so we need to construct it here using the text (title) got from the user
            const newTodo = { title };

            //make the request to the Model
            Model.addTodo(newTodo)
                .then((res) => {
                    //create a new array with the values of the old array
                    state.todos = [res, ...state.todos];
                    event.target[0].value = ""
                })
                .catch((err) => {
                    alert(`add new task failed: ${err}`);
                });
        });
    };

    const removeTodo = () => {
        //event bubbling: event listener from parent element can receive event emitted from its child
        //when the button delete is clicked, take the event
        View.todoListEl.addEventListener("click",(event)=>{
            //console.log(event.target/* emit the event */, event.currentTarget/* receive the event */);
            
            //we have many different remove button, we need to identify which
            //one is being clicked by taking its id
            const id = event.target.id;
            //console.log("id", id)

            //when a delete btn is clicked
            if(event.target.className === "btn--delete"){
                //call de removeTodo passing the id of the button
                Model.removeTodo(id).then(res=>{
                    //take the current array todos and assign to a new one
                    //with the elements that IS NOT equal to the id passed
                    //the + sign forces JS to convert it to a number (avoid typeError)
                    state.todos = state.todos.filter(todo=> +todo.id !== +id)
                }).catch(err=>alert(`delete todo failed: ${err}`))
            }
        })
    };

    //initialization of the application
    const bootstrap = () => {
        addTodo(); //add new todos
        getTodos(); //get the initial data. It is async
        removeTodo(); //remove newTodos

        //whenever the data is updated, we want to update the website as well
        state.subscribe(() => {
            View.updateTodoList(state.todos);
        });
    };

    return {
        bootstrap,
    };
})(View, Model);
//this takes View and Model as parameters

ViewModel.bootstrap();
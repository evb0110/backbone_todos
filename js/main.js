const Todo = Backbone.Model.extend();

const makeId = () => Math.random().toString().slice(2, 10);
const makeTodoWithId = (todoTitle) =>
  new Todo({
    id: makeId(),
    title: todoTitle,
  });

const Todos = Backbone.Collection.extend({
  model: Todo,
});

const TodoView = Backbone.View.extend({
  tagName: "li",
  events: {
    "click .done": "onClickDone",
    "click .undo": "onClickUndo",
    "click .clear": "onClickClear",
  },
  onClickDone() {
    this.$el.find(".title").addClass("crossed");
    this.model.set("done", true);
  },
  onClickUndo() {
    this.$el.find(".title").removeClass("crossed");
    this.model.set("done", false);
    console.log("Undo clicked");
  },
  onClickClear() {
    console.log("Clear clicked");
    const found = $(this.el);
    $("li#" + found.context.id).remove();
  },

  render() {
    const template = _.template($("#todoTemplate").html());
    const html = template(this.model.toJSON());
    this.$el.html(html);
    this.$el.attr("id", this.model.id);
    return this;
  },
});

const TodosView = Backbone.View.extend({
  initialize() {
    this.model.on("add", this.onTodoAdded, this);
    this.model.on("remove", this.onTodoRemoved, this);
    document
      .querySelector(".add-todo")
      .addEventListener("click", this.addToModel.bind(this));
    document.querySelector("#new-todo").addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        this.addToModel.apply(this);
      }
    });
    document
      .querySelector(".clear-all-done")
      .addEventListener("click", this.clearAllDone.bind(this));
    this.model.on("remove", this.onTodoRemoved, this);
  },
  addToModel: function () {
    const newEl = document.querySelector("#new-todo");
    if (newEl.value) {
      this.model.add(makeTodoWithId(newEl.value));
      newEl.value = "";
    }
  },
  onTodoAdded(todo) {
    console.log("Todo added", todo);
    const todoView = new TodoView({ model: todo });
    this.$el.append(todoView.render().$el);
  },
  onTodoRemoved(todo) {
    $("#" + todo.id).remove();
    this.model.remove(this.model.where({ id: todo.id }));
  },
  clearAllDone() {
    console.log("clearing all done");
    const foundIDs = this.model.models
      .filter((m) => m.get('done'))
      .map(({ id }) => id);
    foundIDs.forEach((id) => this.onTodoRemoved({ id }));
    console.log(this.model);
  },
  render() {
    this.model.each((todo) => {
      const todoView = new TodoView({ model: todo });
      this.$el.append(todoView.render().$el);
    });
  },
});

const todos = new Todos();

const todosView = new TodosView({ el: "#todos", model: todos });

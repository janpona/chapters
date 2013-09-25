(function($){
  // `Backbone.sync`: Overrides persistence storage with dummy function. This enables use of `Model.destroy()` without raising an error.
  Backbone.sync = function(method, model, success, error){
    success();
  }

  var Word = Backbone.Model.extend({
    defaults: {
      part1: 'hello',
      part2: 'word'
    }
  });

  var List = Backbone.Collection.extend({
    model: Word
  });

  var WordView = Backbone.View.extend({
    tagName: 'li', // name of tag to be created
    // `WordView`s now respond to two clickable actions for each `Word`: swap and delete.
    events: {
      'click span.swap':  'swap',
      'click span.delete': 'remove'
    },
    // `initialize()` now binds model change/removal to the corresponding handlers below.
    initialize: function(){
      _.bindAll(this, 'render', 'unrender', 'swap', 'remove'); // every function that uses 'this' as the current object should be in here

      this.model.bind('change', this.render);
      this.model.bind('remove', this.unrender);
    },
    // `render()` now includes two extra `span`s corresponding to the actions swap and delete.
    render: function(){
      $(this.el).html('<span style="color:black;">'+this.model.get('part1')+' '+this.model.get('part2')+'</span> &nbsp; &nbsp; <span class="swap" style="font-family:sans-serif; color:blue; cursor:pointer;">[swap]</span> <span class="delete" style="cursor:pointer; color:red; font-family:sans-serif;">[delete]</span>');
      return this; // for chainable calls, like .render().el
    },
    // `unrender()`: Makes Model remove itself from the DOM.
    unrender: function(){
      $(this.el).remove();
    },
    // `swap()` will interchange an `Word`'s attributes. When the `.set()` model function is called, the event `change` will be triggered.
    swap: function(){
      var swapped = {
        part1: this.model.get('part2'),
        part2: this.model.get('part1')
      };
      this.model.set(swapped);
    },
    // `remove()`: We use the method `destroy()` to remove a model from its collection. Normally this would also delete the record from its persistent storage, but we have overridden that (see above).
    remove: function(){
      this.model.destroy();
    }
  });

  // Because the new features (swap and delete) are intrinsic to each `Word`, there is no need to modify `ListView`.
  var ListView = Backbone.View.extend({
    el: $('body'), // el attaches to existing element
    events: {
      'click button#add': 'addWord'
    },
    initialize: function(){
      _.bindAll(this, 'render', 'addWord', 'appendWord'); // every function that uses 'this' as the current object should be in here

      this.collection = new List();
      this.collection.bind('add', this.appendWord); // collection event binder

      this.counter = 0;
      this.render();
    },
    render: function(){
      var self = this;
      $(this.el).append("<button id='add'>Next word</button>");
      $(this.el).append("<ul></ul>");
      _(this.collection.models).each(function(word){ // in case collection is not empty
        self.appendWord(word);
      }, this);
    },
    addWord: function(){
      this.counter++;
      var word = new Word();
      word.set({
        part2: word.get('part2') + this.counter // modify word defaults
      });
      this.collection.add(word);
    },
    appendWord: function(word){
      var wordView = new WordView({
        model: word
      });
      $('ul', this.el).append(wordView.render().el);
    }
  });

  var listView = new ListView();
})(jQuery);

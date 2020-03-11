const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:admin@cluster0-g0l6b.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemSchema);

const def1 = new Item({
  name: "Welcome!"
})

const def2 = new Item({
  name: "Hit the + to add a new item"
})

const def3 = new Item({
  name: "<--- Hit this to delete item"
})

const defaultitem = [def1, def2, def3];


app.get("/", function(req, res) {
  Item.find({}, function(err, results) {
    if (results.length == 0) {
      Item.insertMany(defaultitem, function(err) {
        if (!err) {
          console.log("success");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listtitle: "Today",
        newlistitem: results
      });
    }
  });
});

app.post("/delete", function(req, res) {
  const itemid = req.body.chkbx;
  var listname = req.body.hiddenlist;

  if (listname == "Today") {
    Item.findByIdAndRemove(itemid, function(err) {
      if (!err) {
        console.log("removed");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listname},{$pull: {items: {_id:itemid}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+listname);
      }
    })
  }
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.button;

  const item = new Item({
    name: itemName
  });

  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundlist) {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listName);
    });
  }
});

app.get("/:customlistname", function(req, res) {
  var listname = _.capitalize(req.params.customlistname);
  List.findOne({
    name: listname
  }, function(err, foundlist) {
    if (foundlist) {
      console.log("exist");
      res.render("list", {
        listtitle: foundlist.name,
        newlistitem: foundlist.items
      });
    } else {
      var list = new List({
        name: listname,
        items: defaultitem
      });
      list.save();
      res.redirect("/" + listname);
    }
  })

});

app.listen(3000, function() {
  console.log("Started");
});

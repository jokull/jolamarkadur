
FormView = require './forms'

exports.Stalls = class Stalls extends Backbone.Collection
    url: '/stalls'
    parse: (response) ->
        response.stalls

exports.StallsView = class StallsView extends Backbone.View

    el: ".signups ul"

    initialize: (options) ->
        @collection.bind "add", @add

    add: (model) =>
        view = new StallView model: model
        ($ @el).prepend view.render().el


exports.StallView = class StallView extends Backbone.View
    tagName: "li"
    template: require "./templates/stall"
    render: =>
        console.log @model.toJSON()
        ($ @el).html (@template @model.toJSON())
        return this


exports.StallForm = class StallForm extends FormView
    el: "form"
    method: -> "POST"
    url: -> "/stalls"
    fields: ['description', 'email', 'name', 'entity']
    events:
        "submit": "submit"
    created: (data) =>
        Farm.stallsView.add (new Backbone.Model data)
        ($ @el).fadeOut("slow").html("Takk!").fadeIn()

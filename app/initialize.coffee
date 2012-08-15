# App Namespace
# Change `Farm` to your app's name

@Farm ?= {}

{Stalls, StallsView, StallForm} = require './views/stalls'

$ ->
    # Initialize App
    Farm.stalls = new Stalls
    Farm.stallsView = new StallsView
        collection: Farm.stalls
    Farm.stallsFormView = new StallForm
    Farm.stalls.fetch add: true
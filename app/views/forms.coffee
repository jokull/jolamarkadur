module.exports = class FormView extends Backbone.View
  events:
    "submit": "submit"

  serialize: =>
    form = {}
    for field in @fields
      form[field] = ($ ":input[name=#{field}]", @el).val()
    return form

  method: =>
    ($ @el).attr "method"

  url: =>
    ($ @el).attr "action"

  formdata: => {}  # Extra formdata

  submit: (event) =>
    event.preventDefault()
    $.ajax
      contentType: "application/json"
      dataType: "json"
      url: @url()
      type: @method()
      data: JSON.stringify (_.extend @serialize(), @formdata())
      success: @success
      error: @error
      statusCode:
        422: @validation
        202: @wrapSuccess(@pending)
        201: @wrapSuccess(@created)
        200: @wrapSuccess(@success)

  wrapSuccess: (callback) =>
    that = @
    return (data, status, xhr) ->
      that.reset()
      callback(data, status, xhr)

  pending: => {}
  created: => {}
  success: => {}

  reset: =>
    ($ ".control-group.error", @el).removeClass "error"
    ($ ".help-inline", @el).empty()

  validation: (xhr, status, error) =>
    errors = (JSON.parse xhr.responseText).errors
    return unless errors?
    @reset()
    for field, message of errors
      # Color
      ($ ":input[name=#{field}]", @el)
        .focus()
        .siblings(".help-inline").html(message)
        .parents(".control-group:first").addClass "error"
      return field

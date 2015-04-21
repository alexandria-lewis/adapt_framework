/*
* ButtonsView
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley
*/

define(function() {

    var Adapt = require('coreJS/adapt');

    var ButtonsView = Backbone.View.extend({
        
        initialize: function() {
            this.listenTo(Adapt, 'remove', this.remove);
            this.listenTo(this.model, 'change:_buttonState', this.onButtonStateChanged);
            this.listenTo(this.model, 'change:feedbackMessage', this.onFeedbackMessageChanged);
            this.listenTo(this.model, 'change:_attemptsLeft', this.onAttemptsChanged);
            this.render();
        },

        events: {
            'click .buttons-action': 'onActionClicked',
            'click .buttons-feedback': 'onFeedbackClicked'
        },

        render: function() {
            var data = this.model.toJSON();
            var template = Handlebars.templates['buttons'];
            _.defer(_.bind(function() {
                this.postRender();
                Adapt.trigger('buttonsView:postRender', this);
            }, this));
            this.$el.html(template(data));
        },

        postRender: function() {
            this.updateAttemptsCount();
            this.onButtonStateChanged(null, this.model.get('_buttonState'));
            this.onFeedbackMessageChanged(null, this.model.get('feedbackMessage'));
        },

        onActionClicked: function() {
            var buttonState = this.model.get('_buttonState');
            this.trigger('buttons:' + buttonState);
        },

        onFeedbackClicked: function() {
            this.trigger('buttons:showFeedback');
        },

        onFeedbackMessageChanged: function(model, changedAttribute) {
            if (changedAttribute && this.model.get('_canShowFeedback')) {
				//enable feedback button
                this.$('.buttons-feedback').a11y_cntrl_enabled(true);
            } else {
				//disable feedback button
                this.$('.buttons-feedback').a11y_cntrl_enabled(false)
            }
        },

        onButtonStateChanged: function(model, changedAttribute) {
			//use correct instead of complete to signify button state
            if (changedAttribute === 'correct') {
				//disable submit button on correct (i.e. no model answer)
                this.$('.buttons-action').a11y_cntrl_enabled(false);
            } else {
                switch(changedAttribute) {
                case "showCorrectAnswer": case "hideCorrectAnswer":
					//make model answer button inaccessible but enabled for visual users
					//	due to inability to represent selected incorrect/correct answers to a screen reader, may need revisiting
                    this.$('.buttons-action').a11y_cntrl(false).html(this.model.get('_buttons')["_" + changedAttribute].buttonText)
                    .attr('aria-label', this.model.get('_buttons')["_" + changedAttribute].ariaLabel);
                    break;
                default:
					//enabled button, make accessible and update aria labels and text.
                    this.$('.buttons-action').a11y_cntrl_enabled(true).html(this.model.get('_buttons')["_" + changedAttribute].buttonText)
                    .attr('aria-label', this.model.get('_buttons')["_" + changedAttribute].ariaLabel);
                }

            }
            this.updateAttemptsCount();
        },

        updateAttemptsCount: function(model, changedAttribute) {
            var isInteractionComplete = this.model.get('_isInteractionComplete');
            var attemptsLeft = (this.model.get('_attemptsLeft')) ? this.model.get('_attemptsLeft') : this.model.get('_attempts')
            var isCorrect = this.model.get('_isCorrect');
            var shouldDisplayAttempts = this.model.get('_shouldDisplayAttempts');
            var attemptsString;                        
            if (!isInteractionComplete && attemptsLeft != 0) {
                attemptsString = attemptsLeft + " ";
                if (attemptsLeft > 1) {
                    attemptsString += this.model.get('_buttons').remainingAttemptsText;
                } else if (attemptsLeft === 1){
                    attemptsString += this.model.get('_buttons').remainingAttemptText;
                }

            } else {
                this.$('.buttons-display-inner').addClass('visibility-hidden');
                var $icon = this.$('.buttons-marking-icon').removeClass('display-none');
                if (isCorrect) {
                    $icon.addClass('icon-tick');
                } else {
                    $icon.addClass('icon-cross');
                }
            }

            if (shouldDisplayAttempts) {
                this.$('.buttons-display-inner').html(attemptsString);
            }
            
        }

    });

    return ButtonsView;

});
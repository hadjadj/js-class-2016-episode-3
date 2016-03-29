import 'client/exercise-02/ng/services/chuck-norris';

window._app.global_ng_module
    .component('fact', {
        templateUrl: 'client/exercise-02/ng/components/fact.html',
        bindings: {
            f: '='
        }
    });

/**
 * Created by raphael on 29/03/2016.
 */

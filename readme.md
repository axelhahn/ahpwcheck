
# password check (ahpwcheck.class.js)

## about

Javascript class for optical verification of an entered password.
You can define count of required letters, digits and special chars. This
class shows fulfilled requirements while a user types his (new) password.

  * Author: Axel Hahn
  * project home: <https://github.com/axelhahn/ahpwcheck>
  * licence: GNU GPL
  * see documentation: <http://www.axel-hahn.de/docs/ahpwcheck/index.htm>


## examples

watch a password field and show requirements

    var oPwCheck = new ahpwcheck(aOptions);
    oPwCheck.watch(
        [id of password field],
        [id of div for output]
    );

Show a score

    var oPwCheck = new ahpwcheck(aOptions);
    alert(oPwCheck.getScore('My:0815;Password');


see example html files in the package and the section **Get started** in the documentation: 
<http://www.axel-hahn.de/docs/ahpwcheck/get_started.htm>

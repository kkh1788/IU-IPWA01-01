document.addEventListener("DOMContentLoaded", function () {

    /*Elemente Formular*/
    const formContainer = document.getElementById("form-container"); /*Formular*/
    
    const abholung = document.getElementById("Abholung");
    const uebergabe = document.getElementById("Uebergabe");
    
    const adresseEingabe = document.getElementById("adresseAbholung");     
    const spendenListe = document.getElementById("spendenListe");
    const abschickButton = document.getElementById("abschicken_button"); 
    const zurueckButton = document.getElementById("zurueck_button");
    const druckButton = document.getElementById("drucken_button");

    const nachAbsendenContainer = document.getElementById("nach-absenden"); /*Json Anzeige*/   
    const jsonOutput = document.getElementById("json-output");/*Ausgabe der Bestätigung*/

    /*Fehlermeldungen*/
    const errorMessageLand = document.getElementById("error-message_land");
    const errorMessageAbholung = document.getElementById("error-message_abholung");
    const errorMessageAdresse = document.getElementById("error-message_adresse");
    const errorMessageKleidung = document.getElementById("error-message_kleidung");
    const errorMessagePLZ = document.getElementById("error-message_plz");

    
    /*Ticketnummersystem einführen*/
    let ticketNumber = localStorage.getItem("ticketNumber") ? parseInt(localStorage.getItem("ticketNumber")) : 1000;

    /*Überprüfung*/
    /* Sicherstellen, dass nur eine Option gewählt werden kann (Abholung ODER Übergabe) */
    function validateAbholungUebergabe() {
        /*beide Felder nicht ausgewählt*/
        if (!abholung.checked && !uebergabe.checked) { 
            errorMessageAbholung.style.display = "block";
            return false;
        }
        errorMessageAbholung.style.display = "none";
        return true;
    }
    /*Abholung Adressfeld einblenden*/
    abholung.addEventListener("change", function () {
        if (abholung.checked) {
            uebergabe.checked = false;
            adresseEingabe.style.display = "block";
        } else {
            adresseEingabe.style.display = "none";
        }
    });
  

    /* Kleidungsstück hinzufügen, neue Zeilen hinzufügen - HTML Code */
    function addItem() {
        const newLine = document.createElement("div");
        newLine.classList.add("row", "mb-2", "spenden-item");
        newLine.innerHTML = `
            <div class="col-md-4">
                <input type="text" class="form-control kleidungsstueck" placeholder="Kleidungsstück">
            </div>
            <div class="col-md-2">
                <input type="number" class="form-control anzahl" placeholder="Anzahl">
            </div>
            <div class="col-md-2">
                <input type="text" class="form-control groesse" placeholder="Größe">
            </div>
            <div class="col-md-2">
                <button type="button" id="removeKleidung" class="btn btn-danger remove-item"><svg xmlns="http://www.w3.org/2000/svg" 
                width="16" height="16" fill="currentColor" class="bi bi-file-minus" viewBox="0 0 16 16">
                <path d="M5.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5"/>
                <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1
                 1 0 0 1-1-1V2a1 1 0 0 1 1-1"/>
              </svg></button>
              <!---Add Button-->
              <button type="button" id="addKleidung" class="btn btn-success add-item"><svg xmlns="http://www.w3.org/2000/svg" width="16" 
              height="16" fill="currentColor" class="bi bi-file-plus" viewBox="0 0 16 16">
                <path d="M8.5 6a.5.5 0 0 0-1 0v1.5H6a.5.5 0 0 0 0 1h1.5V10a.5.5 0 0 0 1 0V8.5H10a.5.5 0 0 0 0-1H8.5z"/>
                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0
                 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1"/>
              </svg></button>
            </div>
        `;
        spendenListe.appendChild(newLine);
    }

    /* Event Delegation für "+" und "-" */
    document.addEventListener("click", function (event) {
        if (event.target.closest(".add-item")) {
            addItem();
        }
        if (event.target.closest(".remove-item")) {
            event.target.closest(".spenden-item").remove();
        }
    });

    /* JSON-Daten generieren und anzeigen */
    abschickButton.addEventListener("click", function () {
        if (!validateAbholungUebergabe()) return; // Falls beides ausgewählt wurde, Abbruch - weglassen?
        /*weiter laufende Ticketnummer für spätere Zuordnung in der Datenbank*/
        ticketNumber++;
        /*nur im Browser des Nutzers - nur Simulationszwecke - müsste dann für die Datenbank abgeändert werden*/
        localStorage.setItem("ticketNumber", ticketNumber);

        // Spendenland erfassen (muss eines ausgewählt sein- sonst Fehler )
        const spendenlandElement = document.querySelector(".spendenland:checked");
        if (!spendenlandElement) {
            
            errorMessageLand.style.display = "block";
            return;
        }
        errorMessageLand.style.display = "none";
        const spendenland = spendenlandElement.value;

        // Gespendete Kleidung erfassen - Liste
        const kleidungList = [];
        document.querySelectorAll(".spenden-item").forEach(item => {
            const kleidung = item.querySelector(".kleidungsstueck").value;
            const anzahl = item.querySelector(".anzahl").value;
            const groesse = item.querySelector(".groesse").value;
            if (kleidung && anzahl && groesse) {
                kleidungList.push({ kleidung, anzahl, groesse });
            }
        });
        // Fehlerausgabe wenn kein Kleidungsstück eingetragen wurde - Liste wird geprüft
        if (kleidungList.length === 0) {
            
            errorMessageKleidung.style.display= "block";
            return;
        }
        errorMessageKleidung.style.display = "none";
        

        // Adresse erfassen (falls Abholung gewählt - trim() Leerstellen vorne und hinten entfernen)
        let adressDaten = null;
        if (abholung.checked) {
            const anrede = document.querySelector(".anrede").value.trim();
            const titel = document.querySelector(".titel").value.trim();
            const vorname = document.querySelector(".vorname").value.trim();
            const nachname = document.querySelector(".nachname").value.trim();
            const strasse = document.querySelector(".strasse").value.trim();
            const hausnummer = document.querySelector(".hausnummer").value.trim();
            const plz = document.querySelector(".plz").value.trim();
            const ort = document.querySelector(".ort").value.trim();
    
            // **PLZ-Validierung**
           // PLZ muss genau 5 Zeichen lang sein und nur Zahlen enthalten
            if (plz.length !== 5 || isNaN(plz)) {
                errorMessagePLZ.textContent = "Bitte geben Sie eine korrekte PLZ ein!";
                errorMessagePLZ.style.display= "block";
                return;
            }
            errorMessagePLZ.style.display = "none";

            // PLZ muss mit "86" beginnen - Prüfung der Postleitzahl
            if (plz.substring(0, 2) !== "86") {
                errorMessagePLZ.textContent = "Sie liegen außerhalb des Abholradiuses!";
                errorMessagePLZ.style.display= "block";
                return;
            }
            errorMessagePLZ.style.display = "none";

            // **Adressprüfung - Alle Felder müssen ausgefüllt sein**
            if (!vorname || !nachname || !strasse || !hausnummer || !plz || !ort) {
                errorMessageAdresse.style.display= "block";
                return;
            }
            errorMessageAdresse.style.display = "none";

            /*Daten zusammengefasst*/
            adressDaten = {
                anrede,
                titel,
                name: vorname + " " + nachname,
                strasse: strasse + " " + hausnummer,
                plz,
                ort
            };
        }

        // JSON generieren für die Bestätigung der Kleidungsregistrierung
        const jsonData = {
            ticketnummer: ticketNumber,
            spendenland: spendenland,
            /*aktuelles Datum*/
            datum: new Date().toLocaleDateString(),
            uhrzeit: new Date().toLocaleTimeString(),

            kleidung: kleidungList,
            /*für Abholung wichtig*/
            abholung: abholung.checked,
            adresse: adressDaten
        };

        // Formular verstecken, JSON-Datenformat anzeigen
        formContainer.style.display = "none";
        nachAbsendenContainer.style.display = "block";
        jsonOutput.style.display = "block";
        jsonOutput.textContent = JSON.stringify(jsonData, null, 4);
    });

    // Auswahl nach Erstellung der JSON Ausgabe
    // Drucken-Button
    druckButton.addEventListener("click", function () {
        window.print();
    });

    // Zurück-Button
    zurueckButton.addEventListener("click", function () {
        formContainer.style.display = "block";
        nachAbsendenContainer.style.display = "none";
        jsonOutput.style.display = "none";
    });

}); 

    /*Navigationsleiste - globale Anwendung*/
    /*  17:54min https://www.youtube.com/watch?v=R7b3OlEyqug */
    function toggleSubMenu(button) {
        button.nextElementSibling.classList.toggle('show');
        button.classList.toggle('rotate');
        }
    

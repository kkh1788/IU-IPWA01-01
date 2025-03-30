document.addEventListener("DOMContentLoaded", function () {
    const formContainer = document.getElementById("form-container");
    const abschickButton = document.getElementById("abschicken_button");
    const jsonOutput = document.getElementById("json-output");
    const druckButton = document.getElementById("drucken_button");
    const zurueckButton = document.getElementById("zurueck_button");
    const nachAbsendenContainer = document.getElementById("nach-absenden");

    const abholung = document.getElementById("Abholung");
    const uebergabe = document.getElementById("Uebergabe");
    const adresseEingabe = document.getElementById("adresseAbholung");

    const spendenListe = document.getElementById("spendenListe");
    

    /*Error Messages*/
    const errorMessageLand = document.getElementById("error-message_land");
    const errorMessageAbholung = document.getElementById("error-message_abholung");
    const errorMessageAdresse = document.getElementById("error-message_adresse");
    const errorMessageKleidung = document.getElementById("error-message_kleidung");
    const errorMessagePLZ = document.getElementById("error-message_plz");

    

    let ticketNumber = localStorage.getItem("ticketNumber") ? parseInt(localStorage.getItem("ticketNumber")) : 1000;

    /* Sicherstellen, dass nur eine Option gewählt werden kann (Abholung ODER Übergabe) */
    function validateAbholungUebergabe() {
        if (abholung.checked && uebergabe.checked) {
            errorMessageAbholung.textContent = "Bitte wählen Sie entweder 'Abholung' oder 'Übergabe an der Geschäftsstelle' aus – nicht beides!";
            errorMessageAbholung.style.display = "block";
            return false;
        } else if (!abholung.checked && !uebergabe.checked) {
            errorMessageAbholung.textContent = "Bitte wählen Sie eine Übergabeform aus!";
            errorMessageAbholung.style.display = "block";
            return false;
        }
        errorMessageAbholung.style.display = "none";
        return true;
    }

    abholung.addEventListener("change", function () {
        if (abholung.checked) {
            uebergabe.checked = false;
            adresseEingabe.style.display = "block";
        } else {
            adresseEingabe.style.display = "none";
        }
    });

    uebergabe.addEventListener("change", function () {
        if (uebergabe.checked) {
            abholung.checked = false;
            adresseEingabe.style.display = "none";
        }
    });

    /* Kleidungsstück hinzufügen */
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
                <button type="button" id="removeKleidung" class="btn btn-danger remove-item"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-minus" viewBox="0 0 16 16">
                <path d="M5.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5"/>
                <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1"/>
              </svg></button>
              <!---Add Button-->
              <button type="button" id="addKleidung" class="btn btn-success add-item"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-plus" viewBox="0 0 16 16">
                <path d="M8.5 6a.5.5 0 0 0-1 0v1.5H6a.5.5 0 0 0 0 1h1.5V10a.5.5 0 0 0 1 0V8.5H10a.5.5 0 0 0 0-1H8.5z"/>
                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1"/>
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
        if (!validateAbholungUebergabe()) return; // Falls beides ausgewählt wurde, Abbruch

        ticketNumber++;
        localStorage.setItem("ticketNumber", ticketNumber);

        // Spendenland erfassen (muss genau 1 sein)
        const spendenlandElement = document.querySelector(".spendenland:checked");
        if (!spendenlandElement) {
            errorMessageLand.textContent = "Bitte wählen Sie ein Spendenland aus.";
            errorMessageLand.style.display = "block";
            return;
        }
        errorMessageLand.style.display = "none";
        const spendenland = spendenlandElement.value;

        // Gespendete Kleidung erfassen
        const kleidungList = [];
        document.querySelectorAll(".spenden-item").forEach(item => {
            const kleidung = item.querySelector(".kleidungsstueck").value;
            const anzahl = item.querySelector(".anzahl").value;
            const groesse = item.querySelector(".groesse").value;
            if (kleidung && anzahl && groesse) {
                kleidungList.push({ kleidung, anzahl, groesse });
            }
        });

        if (kleidungList.length === 0) {
            errorMessageKleidung.textContent = "Bitte geben Sie mindestens ein Kleidungsstück an.";
            errorMessageKleidung.style.display= "block";
            return;
        }
        errorMessageKleidung.style.display = "none";
        

        // Adresse erfassen (falls Abholung gewählt)
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
                errorMessagePLZ.textContent = "Ihre PLZ liegt außerhalb unseres Abholradius.";
                errorMessagePLZ.style.display= "block";
                return;
            }
            errorMessagePLZ.style.display = "none";

            // PLZ muss mit "86" beginnen
            if (plz.substring(0, 2) !== "86") {
                errorMessagePLZ.textContent = "Ihre PLZ liegt außerhalb unseres Abholradius.";
                errorMessagePLZ.style.display= "block";
                return;
            }
            errorMessagePLZ.style.display = "none";

            // **Adressprüfung - Alle Felder müssen ausgefüllt sein**
            if (!vorname || !nachname || !strasse || !hausnummer || !plz || !ort) {
                errorMessageAdresse.textContent = "Bitte füllen tragen Sie Vorname, Nachname, Straße, Hausnummer, PLZ und Ort ein!";
                errorMessageAdresse.style.display= "block";
                
                return;
            }
            errorMessageAdresse.style.display = "none";

    
            adressDaten = {
                anrede,
                titel,
                name: vorname + " " + nachname,
                strasse: strasse + " " + hausnummer,
                plz,
                ort
            };
        }

        // JSON generieren
        const jsonData = {
            ticketnummer: ticketNumber,
            spendenland: spendenland,
            datum: new Date().toLocaleDateString(),
            uhrzeit: new Date().toLocaleTimeString(),
            kleidung: kleidungList,
            abholung: abholung.checked,
            adresse: adressDaten
        };

        // Formular verstecken, JSON anzeigen
        formContainer.style.display = "none";
        nachAbsendenContainer.style.display = "block";
        jsonOutput.style.display = "block";
        jsonOutput.textContent = JSON.stringify(jsonData, null, 4);
    });

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

/* Dropwdown öffnen und schließen - Sidebar - Youtube Video min!!*/
function toggleSubMenu(button) {
    button.nextElementSibling.classList.toggle('show');
    button.classList.toggle('rotate');
}

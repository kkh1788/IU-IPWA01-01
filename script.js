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
    const checkboxesSpende = document.querySelectorAll(".spendenland");

    const errorMessageLand = document.getElementById("error-message_land");
    const errorMessageAbholung = document.getElementById("error-message_abholung");

    

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
            <div class="col-md-3">
                <input type="number" class="form-control anzahl" placeholder="Anzahl">
            </div>
            <div class="col-md-3">
                <input type="text" class="form-control groesse" placeholder="Größe">
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-danger remove-item">-</button>
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
            alert("Bitte geben Sie mindestens ein Kleidungsstück an.");
            return;
        }

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
                alert("Bitte geben Sie eine gültige PLZ mit genau 5 Zahlen ein.");
                return;
            }
            // PLZ muss mit "86" beginnen
            if (plz.substring(0, 2) !== "86") {
                alert("Ihre PLZ liegt außerhalb unseres Abholradius.");
                return;
            }
            // **Adressprüfung - Alle Felder müssen ausgefüllt sein**
            if (!vorname || !nachname || !strasse || !hausnummer || !plz || !ort) {
                alert("Adresse unvollständig! Bitte füllen Sie alle Felder aus.");
                return;
            }
    
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

/* Dropwdown öffnen und schließen - Sidebar */
function toggleSubMenu(button) {
    button.nextElementSibling.classList.toggle('show');
    button.classList.toggle('rotate');
}

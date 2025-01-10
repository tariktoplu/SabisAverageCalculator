// Select all lesson cards
const lessonCards = document.querySelectorAll(".card-custom.card-stretch");

// Perform operations for each lesson card
lessonCards.forEach((card) => {
  // Find the success grade
  const successGradeCell = card.querySelector(".font-weight-bold");

  // Select the table containing the grades
  const gradeTable = card.querySelector("table");

  // Add edit functionality to existing grades
  const gradeRows = gradeTable.querySelectorAll(
    "tbody tr:not(.average-grade-row)"
  );
  gradeRows.forEach((row) => {
    const gradeCell = row.querySelector(".text-right");
    // Sadece sistem tarafından girilmeyen (boş olan) notlar için düzenleme butonu ekle
    const gradeText = gradeCell ? gradeCell.textContent.trim() : "";

    // Eğer not hücresi boş ise düzenleme butonu ekle
    if (gradeCell && gradeText === "") {
      // Butonları içerecek konteyner
      const buttonContainer = document.createElement("span");
      buttonContainer.style.marginLeft = "5px";
      buttonContainer.style.display = "inline-flex";
      buttonContainer.style.gap = "3px";

      // Edit butonu (kalem ikonu)
      const editButton = document.createElement("button");
      editButton.innerHTML = "✏️";
      editButton.className = "btn btn-sm btn-link p-0";
      editButton.style.fontSize = "12px";
      editButton.style.color = "#666";
      editButton.title = "Düzenle";

      // Reset butonu (çarpı ikonu)
      const resetButton = document.createElement("button");
      resetButton.innerHTML = "✖️";
      resetButton.className = "btn btn-sm btn-link p-0";
      resetButton.style.fontSize = "12px";
      resetButton.style.color = "#666";
      resetButton.title = "Sıfırla";
      resetButton.style.display = "none"; // Başlangıçta gizli

      buttonContainer.appendChild(editButton);
      buttonContainer.appendChild(resetButton);
      gradeCell.appendChild(buttonContainer);

      editButton.addEventListener("click", () => {
        const currentGrade = gradeCell.textContent.trim();

        // Replace with input
        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.max = "100";
        input.value = currentGrade;
        input.style.width = "45px";
        input.style.height = "20px";
        input.style.padding = "2px";
        input.style.fontSize = "12px";

        const saveButton = document.createElement("button");
        saveButton.innerHTML = "✓";
        saveButton.className = "btn btn-sm btn-link p-0";
        saveButton.style.fontSize = "12px";
        saveButton.style.color = "green";
        saveButton.style.marginLeft = "3px";

        gradeCell.textContent = "";
        gradeCell.appendChild(input);
        gradeCell.appendChild(saveButton);

        saveButton.addEventListener("click", () => {
          const newGrade = parseFloat(input.value);
          if (!isNaN(newGrade) && newGrade >= 0 && newGrade <= 100) {
            gradeCell.textContent = newGrade.toString();
            gradeCell.appendChild(buttonContainer);
            resetButton.style.display = "inline"; // Not girildikten sonra reset butonunu göster
            updateAverages(gradeTable);
          } else {
            alert("Lütfen 0-100 arasında geçerli bir not giriniz.");
          }
        });

        // Enter tuşu ile kaydetme
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            saveButton.click();
          }
        });
      });

      // Reset butonu işlevselliği
      resetButton.addEventListener("click", () => {
        gradeCell.textContent = "";
        resetButton.style.display = "none"; // Reset sonrası butonu gizle
        gradeCell.appendChild(buttonContainer);
        updateAverages(gradeTable);
      });
    }
  });

  // Initial calculation
  updateAverages(gradeTable);
});

function calculateMinimumRequiredGrades(gradeTable) {
  const gradeRows = gradeTable.querySelectorAll(
    "tbody tr:not(.average-grade-row)"
  );
  const targetAverage = 40; // Hedef ortalama
  let totalWeight = 0;
  let currentWeightedSum = 0;
  const missingGrades = [];

  // Önce toplam ağırlığı ve mevcut ağırlıklı toplamı hesapla
  gradeRows.forEach((row) => {
    const gradeCell = row.querySelector(".text-right");
    const gradeText = gradeCell.textContent.trim().split(" ")[0]; // Not değerini al
    const grade = parseFloat(gradeText);
    const ratioText = row.querySelector("td:first-child").textContent.trim();
    const ratio = parseFloat(ratioText);

    if (!isNaN(ratio)) {
      totalWeight += ratio;
      if (!isNaN(grade)) {
        currentWeightedSum += (grade * ratio) / 100;
      } else {
        // Notu girilmemiş dersleri kaydet
        missingGrades.push({
          name: row.querySelector("td:nth-child(2)").textContent.trim(),
          ratio: ratio,
        });
      }
    }
  });

  // Her eksik not için minimum gereken notu hesapla
  const results = missingGrades.map((missing) => {
    // Diğer eksik notların minimum katkısını hesapla (0 alındığını varsayarak)
    const otherMissingWeightedSum = missingGrades
      .filter((g) => g !== missing)
      .reduce((sum, g) => sum + (0 * g.ratio) / 100, 0);

    // Bu ders için gereken minimum notu hesapla
    const requiredWeightedSum =
      (targetAverage * totalWeight) / 100 -
      currentWeightedSum -
      otherMissingWeightedSum;
    const requiredGrade = (requiredWeightedSum * 100) / missing.ratio;

    return {
      name: missing.name,
      requiredGrade: Math.max(0, Math.min(100, Math.ceil(requiredGrade))),
    };
  });

  return results;
}

function updateAverages(gradeTable) {
  let averageGradeRow = gradeTable.querySelector(".average-grade-row");
  const displayAverageGrade = calculateDisplayAverageGrade(gradeTable);
  const colorScore = calculateColorScore(displayAverageGrade, gradeTable);
  const minRequiredGrades = calculateMinimumRequiredGrades(gradeTable);

  let minRequiredText = "";
  if (minRequiredGrades.length > 0) {
    minRequiredText = minRequiredGrades
      .map((g) => `${g.name}: ${g.requiredGrade}`)
      .join("<br>");
  }

  if (averageGradeRow) {
    averageGradeRow.innerHTML = `
          <td></td>
          <td class="font-weight-bold">
              Ortalama
              ${
                minRequiredGrades.length > 0
                  ? '<br><span style="font-size: 0.9em; color: #666;">40 için gereken</span>'
                  : ""
              }
          </td>
          <td class="text-right font-weight-bold">
              <span style="color: ${getColorForGrade(colorScore)};">
                  ${displayAverageGrade.toFixed(2)}
              </span>
              ${
                minRequiredGrades.length > 0
                  ? '<br><span style="font-size: 0.9em; color: #666;">' +
                    minRequiredGrades
                      .map((g) => `${g.name}: ${g.requiredGrade}`)
                      .join("<br>") +
                    "</span>"
                  : ""
              }
          </td>
      `;
  } else {
    averageGradeRow = document.createElement("tr");
    averageGradeRow.classList.add("average-grade-row");
    averageGradeRow.innerHTML = `
          <td></td>
          <td class="font-weight-bold">
              Ortalama
              ${
                minRequiredGrades.length > 0
                  ? '<br><span style="font-size: 0.9em; font-weight:semi-bold; color: #666;">40 için gereken</span>'
                  : ""
              }
          </td>
          <td class="text-right font-weight-bold">
              <span style="color: ${getColorForGrade(colorScore)};">
                  ${displayAverageGrade.toFixed(2)}
              </span>
              ${
                minRequiredGrades.length > 0
                  ? '<br><span style="font-size: 0.9em; color: #666;">' +
                    minRequiredGrades
                      .map((g) => `${g.name}: ${g.requiredGrade}`)
                      .join("<br>") +
                    "</span>"
                  : ""
              }
          </td>
      `;
    gradeTable.querySelector("tbody").appendChild(averageGradeRow);
  }
}

function calculateDisplayAverageGrade(gradeTable) {
  const gradeRows = gradeTable.querySelectorAll(
    "tbody tr:not(.average-grade-row)"
  );
  let totalGrade = 0;
  let totalWeight = 0;

  gradeRows.forEach((row) => {
    const gradeText = row.querySelector(".text-right").textContent.trim();
    const grade = parseFloat(gradeText);
    const ratioText = row.querySelector("td:first-child").textContent.trim();
    const ratio = parseFloat(ratioText);

    if (!isNaN(grade) && !isNaN(ratio)) {
      totalGrade += (grade * ratio) / 100;
      totalWeight += ratio;
    }
  });

  return totalWeight > 0 ? totalGrade : 0;
}

function calculateColorScore(calculatedGrade, gradeTable) {
  const gradeRows = gradeTable.querySelectorAll(
    "tbody tr:not(.average-grade-row)"
  );
  let totalWeight = 0;

  gradeRows.forEach((row) => {
    const gradeText = row.querySelector(".text-right").textContent.trim();
    const ratioText = row.querySelector("td:first-child").textContent.trim();
    const ratio = parseFloat(ratioText);

    if (!isNaN(parseFloat(gradeText))) {
      totalWeight += ratio;
    }
  });

  return totalWeight > 0 ? (calculatedGrade * 100) / totalWeight : 0;
}

function getColorForGrade(colorScore) {
  if (colorScore > 75) {
    return "green";
  } else if (colorScore >= 55) {
    return "blue";
  } else {
    return "red";
  }
}

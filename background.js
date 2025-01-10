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
    if (gradeCell) {
      // Add edit button next to existing grades
      const editButton = document.createElement("button");
      editButton.textContent = "Düzenle";
      editButton.className = "btn btn-sm btn-info";
      editButton.style.marginLeft = "5px";
      gradeCell.appendChild(editButton);

      editButton.addEventListener("click", () => {
        const currentGrade = gradeCell.textContent.trim();

        // Replace with input
        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.max = "100";
        input.value = currentGrade;
        input.style.width = "60px";

        const saveButton = document.createElement("button");
        saveButton.textContent = "Kaydet";
        saveButton.className = "btn btn-sm btn-success";
        saveButton.style.marginLeft = "5px";

        gradeCell.textContent = "";
        gradeCell.appendChild(input);
        gradeCell.appendChild(saveButton);

        saveButton.addEventListener("click", () => {
          const newGrade = parseFloat(input.value);
          if (!isNaN(newGrade) && newGrade >= 0 && newGrade <= 100) {
            gradeCell.textContent = newGrade.toString();
            // Add edit button back
            gradeCell.appendChild(editButton);
            updateAverages(gradeTable);
          } else {
            alert("Lütfen 0-100 arasında geçerli bir not giriniz.");
          }
        });
      });
    }
  });

  // Initial calculation
  updateAverages(gradeTable);
});

// Function to update averages after grade input
function updateAverages(gradeTable) {
  let averageGradeRow = gradeTable.querySelector(".average-grade-row");
  const displayAverageGrade = calculateDisplayAverageGrade(gradeTable);
  const colorScore = calculateColorScore(displayAverageGrade, gradeTable);

  if (averageGradeRow) {
    averageGradeRow.innerHTML = `
            <td></td>
            <td class="font-weight-bold">Ortalama</td>
            <td class="text-right font-weight-bold">
                <span style="color: ${getColorForGrade(
                  colorScore
                )}; font-weight: bold">
                    ${displayAverageGrade.toFixed(2)}
                </span>
            </td>
        `;
  } else {
    averageGradeRow = document.createElement("tr");
    averageGradeRow.classList.add("average-grade-row");
    averageGradeRow.innerHTML = `
            <td></td>
            <td class="font-weight-bold">Ortalama</td>
            <td class="text-right font-weight-bold">
                <span style="color: ${getColorForGrade(
                  colorScore
                )}; font-weight: bold">
                    ${displayAverageGrade.toFixed(2)}
                </span>
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

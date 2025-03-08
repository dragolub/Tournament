const readline = require('readline');

// Създаване на интерфейс за четене от конзолата
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Функция за четене на вход от потребителя
function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

// Основна функция за генериране на турнирна схема
async function generateTournamentBracket() {
  console.log("Програма за генериране на турнирна схема на Да Дао");
  console.log("==================================================");

  // Въвеждане на броя на състезателите и поставените играчи
  let totalPlayers, seededPlayers;
  
  try {
    totalPlayers = parseInt(await askQuestion("Въведете общия брой състезатели: "));
    seededPlayers = parseInt(await askQuestion("Въведете броя на поставените състезатели: "));
    
    if (isNaN(totalPlayers) || isNaN(seededPlayers)) {
      throw new Error("Невалидни числа");
    }
    
    if (totalPlayers < 2) {
      console.log("Трябват поне 2 състезатели за турнир.");
      rl.close();
      return;
    }
    
    if (seededPlayers > totalPlayers) {
      console.log("Броят на поставените състезатели не може да бъде по-голям от общия брой.");
      rl.close();
      return;
    }
  } catch (error) {
    console.log("Моля, въведете валидни числа.");
    rl.close();
    return;
  }
  
  // Изчисляване на най-близката степен на 2 за размера на схемата
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(totalPlayers)));
  const byes = bracketSize - totalPlayers;  // Брой на свободните места в първи кръг
  
  console.log(`\nСъздаване на схема за ${totalPlayers} състезатели (${seededPlayers} поставени)`);
  console.log(`Размер на схемата: ${bracketSize} (с ${byes} свободни места в първи кръг)`);
  
  // Въвеждане на имена на състезателите
  const players = [];
  
  console.log("\nВъведете имена на поставените състезатели:");
  for (let i = 1; i <= seededPlayers; i++) {
    const name = await askQuestion(`Име на поставен играч ${i}: `);
    players.push(`[${i}] ${name}`);
  }
  
  console.log("\nВъведете имена на неподставените състезатели:");
  for (let i = seededPlayers + 1; i <= totalPlayers; i++) {
    const name = await askQuestion(`Име на играч ${i}: `);
    players.push(name);
  }
  
  // Създаване на схемата
  const bracket = Array(bracketSize).fill("Свободно място");
  
  // Поставяне на поставените играчи на стратегически позиции
  placeSeededPlayers(bracket, players.slice(0, seededPlayers), bracketSize);
  
  // Разпределяне на останалите играчи и свободните места
  const remainingPlayers = players.slice(seededPlayers);
  const remainingSpots = [];
  
  for (let i = 0; i < bracketSize; i++) {
    if (bracket[i] === "Свободно място") {
      remainingSpots.push(i);
    }
  }
  
  // Случайно разбъркване на останалите играчи
  shuffle(remainingPlayers);
  
  // Поставяне на останалите играчи на свободните места
  for (let i = 0; i < remainingPlayers.length; i++) {
    bracket[remainingSpots[i]] = remainingPlayers[i];
  }
  
  // Отпечатване на схемата за първи кръг
  console.log("\nСхема на турнира (първи кръг):");
  printFirstRound(bracket);
  
  // Визуализиране на цялата турнирна схема
  console.log("\nВизуализация на цялата турнирна схема:");
  visualizeFullBracket(bracket);
  
  rl.close();
  return bracket;
}

// Функция за поставяне на поставените играчи
function placeSeededPlayers(bracket, seededPlayers, bracketSize) {
  if (seededPlayers.length === 0) {
    return;
  }
  
  // Първият поставен отива на първа позиция
  bracket[0] = seededPlayers[0];
  
  if (seededPlayers.length > 1) {
    // Вторият поставен отива в долната част на схемата
    bracket[bracketSize - 1] = seededPlayers[1];
  }
  
  if (seededPlayers.length > 2) {
    // Третият и четвъртият се поставят в средата на полусхемите
    const quarterSize = Math.floor(bracketSize / 4);
    bracket[quarterSize] = seededPlayers[2];
    
    if (seededPlayers.length > 3) {
      bracket[quarterSize * 3] = seededPlayers[3];
    }
  }
  
  // За повече от 4 поставени играчи, използваме стандартния алгоритъм за поставяне
  if (seededPlayers.length > 4) {
    const remainingSeeded = seededPlayers.slice(4);
    const sections = 8;  // Разделяме схемата на 8 секции
    const sectionSize = Math.floor(bracketSize / sections);
    
    // Позиции за поставените играчи 5-8 (ако има такива)
    const positions = [
      Math.floor(sectionSize / 2),
      sectionSize * 3 + Math.floor(sectionSize / 2),
      sectionSize * 5 + Math.floor(sectionSize / 2),
      sectionSize * 7 + Math.floor(sectionSize / 2)
    ];
    
    // Поставяне на играчи 5-8
    for (let i = 0; i < Math.min(4, remainingSeeded.length); i++) {
      bracket[positions[i]] = remainingSeeded[i];
    }
  }
}

// Функция за отпечатване на първи кръг
function printFirstRound(bracket) {
  const roundMatches = Math.floor(bracket.length / 2);
  
  for (let i = 0; i < roundMatches; i++) {
    const player1Idx = i * 2;
    const player2Idx = i * 2 + 1;
    
    const matchNum = i + 1;
    const player1 = bracket[player1Idx];
    const player2 = bracket[player2Idx];
    
    console.log(`Мач ${matchNum}: ${player1} срещу ${player2}`);
  }
}

// Функция за визуализиране на цялата турнирна схема
function visualizeFullBracket(firstRoundBracket) {
  const bracketSize = firstRoundBracket.length;
  const rounds = Math.log2(bracketSize);
  
  // Инициализиране на схемата за всички кръгове
  const fullBracket = Array(rounds).fill().map(() => []);
  fullBracket[0] = [...firstRoundBracket];
  
  // Попълване на местата за следващите кръгове с празни места
  for (let r = 1; r < rounds; r++) {
    const roundSize = bracketSize / Math.pow(2, r);
    fullBracket[r] = Array(roundSize).fill("__________");
  }
  
  // Печатане на схемата
  printFullBracket(fullBracket, rounds);
}

// Функция за отпечатване на цялата схема
function printFullBracket(fullBracket, rounds) {
  const bracketSize = fullBracket[0].length;
  
  // Определяне на максималната дължина на имената за правилно подравняване
  let maxNameLength = 0;
  for (const player of fullBracket[0]) {
    maxNameLength = Math.max(maxNameLength, player.length);
  }
  
  // Ширина на колона за всеки кръг
  const columnWidth = Math.max(maxNameLength + 4, 14);
  
  // Отпечатване на заглавие за всеки кръг
  const roundHeaders = [];
  for (let r = 0; r < rounds; r++) {
    if (r === 0) {
      roundHeaders.push("Първи кръг");
    } else if (r === rounds - 1) {
      roundHeaders.push("Финал");
    } else if (r === rounds - 2) {
      roundHeaders.push("Полуфинали");
    } else if (r === rounds - 3) {
      roundHeaders.push("Четвъртфинали");
    } else {
      roundHeaders.push(`Кръг ${r+1}`);
    }
  }
  
  let header = "";
  for (let r = 0; r < rounds; r++) {
    header += centerText(roundHeaders[r], columnWidth) + " ";
  }
  console.log(header);
  console.log("=".repeat(columnWidth * rounds));
  
  // Изчисляване на броя на редовете, необходими за визуализацията
  const rows = bracketSize;
  
  // Инициализиране на матрица за отпечатване
  const display = Array(rows).fill().map(() => Array(rounds).fill(""));
  
  // Попълване на първия кръг
  for (let i = 0; i < bracketSize; i++) {
    display[i][0] = fullBracket[0][i];
  }
  
  // Попълване на следващите кръгове
  for (let r = 1; r < rounds; r++) {
    const roundSize = bracketSize / Math.pow(2, r);
    const spacing = bracketSize / roundSize;
    
    for (let i = 0; i < roundSize; i++) {
      const row = i * spacing + Math.floor(spacing / 2) - 1;
      display[row][r] = fullBracket[r][i];
    }
  }
  
  // Отпечатване на схемата
  for (let row = 0; row < rows; row++) {
    let line = "";
    for (let col = 0; col < rounds; col++) {
      if (display[row][col]) {
        line += padRight(display[row][col], columnWidth) + " ";
      } else {
        line += " ".repeat(columnWidth) + " ";
      }
    }
    console.log(line);
    
    // Отпечатване на линии, свързващи мачовете
    if (row < rows - 1) {
      let connectorLine = "";
      for (let col = 0; col < rounds - 1; col++) {
        const roundSize = bracketSize / Math.pow(2, col);
        const spacing = bracketSize / roundSize;
        
        if (row % spacing === Math.floor(spacing / 2) - 1 && display[row][col]) {
          connectorLine += " ".repeat(columnWidth - 1) + "└" + "─".repeat(columnWidth - 1) + "┐" + " ";
        } else if (row % spacing === spacing - 1 && display[row][col]) {
          connectorLine += " ".repeat(columnWidth - 1) + "┌" + "─".repeat(columnWidth - 1) + "┘" + " ";
        } else if (row % (spacing * 2) >= Math.floor(spacing / 2) - 1 && row % (spacing * 2) < spacing + Math.floor(spacing / 2) - 1) {
          const nextCol = col + 1;
          if (nextCol < rounds && row % (spacing * 2) === spacing - 1) {
            connectorLine += " ".repeat(columnWidth) + "│" + " ";
          } else {
            connectorLine += " ".repeat(columnWidth) + " " + " ";
          }
        } else {
          connectorLine += " ".repeat(columnWidth) + " " + " ";
        }
      }
      
      console.log(connectorLine);
    }
  }
}

// Функция за центриране на текст
function centerText(text, width) {
  const padding = width - text.length;
  const paddingLeft = Math.floor(padding / 2);
  const paddingRight = padding - paddingLeft;
  return " ".repeat(paddingLeft) + text + " ".repeat(paddingRight);
}

// Функция за подравняване на текст вдясно
function padRight(text, width) {
  const padding = width - text.length;
  return text + " ".repeat(Math.max(0, padding));
}

// Функция за разбъркване на масив (Fisher-Yates shuffle)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Стартиране на програмата
generateTournamentBracket();

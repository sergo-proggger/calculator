// Калькулятор стоимости сайта. Перенесён из темы WordPress cherncode-pro (assets/js/main.js).
(() => {
  /* project cost calculator */
  const calc = document.querySelector('[data-calculator]');
  if (calc) {
    const calcConfig = {
      landing: { label: 'Лендинг / сайт-визитка', price: [25000, 40000], days: [3, 5] },
      multipage: { label: 'Многостраничный сайт', price: [60000, 100000], days: [10, 15] },
      shop: { label: 'Интернет-магазин (WooCommerce)', price: [90000, 150000], days: [15, 20] },
      revamp: { label: 'Доработка существующего сайта', price: [15000, 35000], days: [3, 7] },
    };
    const calcTypeButtons = [...calc.querySelectorAll('[data-calc-type] button')];
    const calcUrgencyButtons = [...calc.querySelectorAll('[data-calc-urgency] button')];
    const calcPagesGroup = calc.querySelector('[data-calc-pages-group]');
    const calcPagesInput = calc.querySelector('[data-calc-pages]');
    const calcPagesValue = calc.querySelector('[data-calc-pages-value]');
    const calcFeatures = [...calc.querySelectorAll('[data-calc-feature]')];
    const calcPriceOut = calc.querySelector('[data-calc-price]');
    const calcDaysOut = calc.querySelector('[data-calc-days]');
    const calcListOut = calc.querySelector('[data-calc-summary-list]');
    const calcSendBtn = calc.querySelector('[data-calc-send]');
    const calcCopyBtn = calc.querySelector('[data-calc-copy]');
    const calcPreview = calc.querySelector('[data-calc-preview]');

    const calcState = { type: 'landing', urgency: 'standard', pages: 5 };

    const calcRound = n => Math.round(n / 1000) * 1000;
    const calcMoney = n => calcRound(n).toLocaleString('ru-RU');

    const calcCompute = () => {
      const base = calcConfig[calcState.type];
      let minP = base.price[0];
      let maxP = base.price[1];
      let minD = base.days[0];
      let maxD = base.days[1];
      const items = [];

      if (calcState.type === 'multipage' && calcState.pages > 5) {
        const extraPages = calcState.pages - 5;
        const extraPrice = extraPages * 3500;
        minP += extraPrice; maxP += extraPrice;
        minD += Math.ceil(extraPages * 0.5); maxD += Math.ceil(extraPages * 0.7);
        items.push(`Страниц: ${calcState.pages} (+${calcMoney(extraPrice)} ₽)`);
      }

      calcFeatures.forEach(input => {
        if (input.checked) {
          const parts = (input.dataset.price || '0-0').split('-').map(Number);
          const fp1 = parts[0]; const fp2 = parts[1];
          const days = Number(input.dataset.days || 0);
          minP += fp1; maxP += fp2;
          minD += Math.round(days * 0.5); maxD += days;
          const labelEl = input.closest('.calculator-feature');
          const label = labelEl ? labelEl.querySelector('span').textContent : '';
          items.push(`${label} (+${calcMoney(fp1)}–${calcMoney(fp2)} ₽)`);
        }
      });

      if (calcState.urgency === 'urgent') {
        minP = minP * 1.3; maxP = maxP * 1.3;
        const newMinD = Math.max(1, Math.round(minD * 0.7));
        const newMaxD = Math.max(newMinD, Math.round(maxD * 0.7));
        minD = newMinD; maxD = newMaxD;
        items.push('Срочный тариф (+30% к стоимости, срок сокращён)');
      }

      return {
        priceText: `${calcMoney(minP)} – ${calcMoney(maxP)} ₽`,
        daysText: `~${minD}–${maxD} рабочих дней`,
        items,
        label: base.label,
      };
    };

    const calcRender = () => {
      const result = calcCompute();
      if (calcPriceOut) calcPriceOut.textContent = result.priceText;
      if (calcDaysOut) calcDaysOut.textContent = result.daysText;
      if (calcListOut) {
        calcListOut.innerHTML = '';
        result.items.forEach(text => {
          const li = document.createElement('li');
          li.textContent = text;
          calcListOut.appendChild(li);
        });
      }
    };

    calcTypeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        calcTypeButtons.forEach(b => { b.classList.toggle('is-selected', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
        calcState.type = btn.dataset.calcValue;
        if (calcPagesGroup) calcPagesGroup.hidden = calcState.type !== 'multipage';
        calcRender();
      });
    });

    calcUrgencyButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        calcUrgencyButtons.forEach(b => { b.classList.toggle('is-selected', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
        calcState.urgency = btn.dataset.calcValue;
        calcRender();
      });
    });

    calcPagesInput?.addEventListener('input', () => {
      calcState.pages = Number(calcPagesInput.value);
      if (calcPagesValue) calcPagesValue.textContent = String(calcState.pages);
      calcRender();
    });

    calcFeatures.forEach(input => {
      input.addEventListener('change', () => {
        const wrap = input.closest('.calculator-feature');
        if (wrap) wrap.classList.toggle('is-checked', input.checked);
        calcRender();
      });
    });

    const calcBuildText = () => {
      const result = calcCompute();
      const base = calcConfig[calcState.type];
      let text = `Здравствуйте, Сергей! Посчитал стоимость на калькуляторе на сайте.\n\nТип проекта: ${base.label}`;
      if (calcState.type === 'multipage') text += ` (${calcState.pages} стр.)`;
      text += `\nДополнительно: ${result.items.length ? result.items.join(', ') : 'без доп. опций'}`;
      text += `\nСрок: ${calcState.urgency === 'urgent' ? 'срочно' : 'стандартный'}`;
      text += `\n\nПримерная стоимость: ${result.priceText}\nПримерный срок: ${result.daysText}`;
      text += `\n\nХочу обсудить проект и уточнить детали.`;
      return text;
    };

    // На сайте кнопка вставляла расчёт в форму заявки. В демо формы нет, поэтому показываем текст заявки.
    calcSendBtn?.addEventListener('click', () => {
      if (!calcPreview) return;
      calcPreview.textContent = calcBuildText();
      calcPreview.hidden = false;
    });

    calcCopyBtn?.addEventListener('click', async () => {
      const text = calcBuildText();
      try {
        await navigator.clipboard.writeText(text);
        const old = calcCopyBtn.textContent;
        calcCopyBtn.textContent = 'Скопировано ✓';
        window.setTimeout(() => { calcCopyBtn.textContent = old; }, 1600);
      } catch (e) {
        calcCopyBtn.textContent = 'Не удалось скопировать';
      }
    });

    calcRender();
  }
})();

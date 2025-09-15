/* =================== RESPONSIVIDADE MOBILE =================== */

/* Tablets e telas médias */
@media (max-width: 1024px) {
    /* Ajustar grid dos cards */
    .cards-grid {
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    }
    
    /* Dashboard hospitalar em coluna única */
    .dashboard-hospitalar {
        grid-template-columns: 1fr;
    }
    
    /* KPIs executivos em 3 colunas */
    .kpis-grid-executivo {
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: auto;
    }
    
    .kpi-box-principal {
        grid-column: span 3;
        grid-row: auto;
    }
}

/* Smartphones */
@media (max-width: 768px) {
    /* Header responsivo */
    header {
        flex-direction: column;
        gap: 10px;
        padding: 10px;
    }
    
    header h1 {
        font-size: 18px;
    }
    
    .header-right {
        width: 100%;
        justify-content: space-between;
    }
    
    #timer {
        font-size: 12px;
    }
    
    /* Cards em coluna única */
    .cards-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    /* Layout 3x3 dos cards em mobile */
    .card-row {
        grid-template-columns: 1fr;
        gap: 10px;
    }
    
    .card-field {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 0;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .field-label {
        display: inline-block;
        margin-bottom: 0;
        margin-right: 10px;
    }
    
    /* Badge leito centralizado */
    .leito-badge {
        width: 100%;
        margin: 10px 0;
    }
    
    /* Seletores de hospital em coluna */
    .hospital-selector {
        flex-direction: column;
        padding: 15px;
    }
    
    .hospital-btn {
        width: 100%;
    }
    
    /* KPIs executivos mobile */
    .kpis-grid-executivo {
        grid-template-columns: 1fr;
        gap: 10px;
    }
    
    .kpi-box-principal {
        grid-column: 1;
        padding: 15px;
    }
    
    .kpi-box {
        padding: 15px;
    }
    
    .kpi-value {
        font-size: 24px;
    }
    
    /* Dashboard hospitalar mobile */
    .hospital-kpis {
        flex-direction: column;
        gap: 10px;
    }
    
    .kpi-box-small {
        width: 100%;
    }
    
    /* Seletores de gráfico mobile */
    .chart-selector {
        flex-wrap: wrap;
    }
    
    .chart-selector button {
        flex: 1;
        min-width: 80px;
        font-size: 11px;
        padding: 4px 8px;
    }
    
    /* Formulários mobile */
    .form-grid {
        grid-template-columns: 1fr;
    }
    
    .medico-form {
        width: 100%;
        max-width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
    }
    
    .medico-form-header {
        padding: 15px;
    }
    
    .medico-form-body {
        padding: 15px;
    }
    
    .checkbox-grid {
        font-size: 14px;
    }
    
    .checkbox-item {
        padding: 10px;
    }
    
    /* Modal admin mobile */
    .admin-panel-content {
        width: 100%;
        max-width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
    }
    
    .admin-tabs {
        flex-wrap: wrap;
    }
    
    .tab-btn {
        flex: 1;
        min-width: 50%;
        padding: 12px 10px;
        font-size: 14px;
    }
    
    .cores-grid {
        grid-template-columns: 1fr;
    }
    
    /* QR Codes mobile */
    .qr-codes-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }
    
    .qr-code-item {
        padding: 10px;
    }
    
    .qr-label {
        font-size: 12px;
    }
    
    /* Menu lateral mobile */
    .side-menu {
        width: 100%;
        left: -100%;
    }
    
    .side-menu.open {
        left: 0;
    }
    
    /* Footer mobile */
    footer {
        padding: 20px 10px;
        font-size: 12px;
    }
    
    footer p {
        margin: 5px 0;
    }
}

/* Smartphones pequenos */
@media (max-width: 480px) {
    /* Ajustes adicionais para telas muito pequenas */
    .card {
        padding: 15px;
    }
    
    .field-label {
        font-size: 10px;
        padding: 3px 6px;
    }
    
    .field-value {
        font-size: 13px;
    }
    
    .section-title {
        font-size: 10px;
        padding: 6px;
    }
    
    .chip {
        font-size: 9px;
        padding: 2px 6px;
    }
    
    .btn-action {
        padding: 8px 12px;
        font-size: 12px;
    }
    
    /* QR Codes em coluna única */
    .qr-codes-grid {
        grid-template-columns: 1fr;
    }
    
    /* Botões menores */
    button {
        font-size: 14px;
        padding: 10px 15px;
    }
    
    /* Inputs menores */
    input, select {
        font-size: 14px;
        padding: 8px;
    }
}

/* Orientação landscape em mobile */
@media (max-width: 768px) and (orientation: landscape) {
    /* Header mais compacto */
    header {
        padding: 5px 10px;
    }
    
    /* Cards em 2 colunas */
    .cards-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    /* KPIs em 2 linhas */
    .kpis-grid-executivo {
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: auto auto;
    }
    
    .kpi-box-principal {
        grid-column: span 3;
    }
}

/* Print styles */
@media print {
    /* Esconder elementos não imprimíveis */
    header,
    .side-menu,
    .hospital-selector,
    .btn-action,
    .chart-selector,
    footer {
        display: none !important;
    }
    
    /* Cards em layout de impressão */
    .cards-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
    }
    
    .card {
        break-inside: avoid;
        page-break-inside: avoid;
        border: 1px solid #000;
        background: white !important;
        color: black !important;
    }
    
    .card * {
        color: black !important;
    }
    
    .leito-badge {
        border: 2px solid #000;
        background: white !important;
        color: black !important;
    }
    
    .leito-badge.ocupado {
        background: #f0f0f0 !important;
    }
    
    /* Gráficos para impressão */
    canvas {
        max-width: 100% !important;
        height: auto !important;
    }
}

/* Acessibilidade - Alto contraste */
@media (prefers-contrast: high) {
    .card {
        border: 2px solid white;
    }
    
    .field-label {
        font-weight: 700;
    }
    
    button {
        border: 2px solid currentColor;
    }
    
    input, select {
        border-width: 2px;
    }
}

/* Modo escuro do sistema */
@media (prefers-color-scheme: dark) {
    /* Já usando cores escuras por padrão */
}

/* Animações reduzidas */
@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }
}

const brands = window.autoAtlasBrands || [];
const models = window.autoAtlasModels || [];

const brandFilter = document.getElementById("brandFilter");
const bodyFilter = document.getElementById("bodyFilter");
const modelSearch = document.getElementById("modelSearch");
const brandGrid = document.getElementById("brandGrid");
const modelList = document.getElementById("modelList");
const brandDetail = document.getElementById("brandDetail");
const modelDetail = document.getElementById("modelDetail");
const brandTotal = document.getElementById("brandTotal");
const modelTotal = document.getElementById("modelTotal");
const bodyTotal = document.getElementById("bodyTotal");
const clearFiltersButton = document.getElementById("clearFilters");
const galleryGrid = document.getElementById("galleryGrid");

if (!brandFilter || !bodyFilter || !modelSearch || !brandGrid || !modelList || !brandDetail || !modelDetail || !galleryGrid) {
    console.warn("The Auto Atlas UI elements are missing.");
} else {
    let selectedModelName = "";

    const renderGallery = () => {
        const galleryModels = models.filter((model) => model.image).slice(0, 6);

        galleryGrid.innerHTML = galleryModels.map((model) => `
            <article class="gallery-card">
                <img src="${model.image}" alt="${model.name}">
                <div class="gallery-overlay">
                    <span class="body-tag">${model.bodyType}</span>
                    <strong>${model.name}</strong>
                </div>
            </article>
        `).join("");
    };

    const getSelectedBrand = () => {
        const selectedBrand = brandFilter.value || "all";
        return selectedBrand === "all" ? null : brands.find((brand) => brand.id === selectedBrand) || null;
    };

    const getFilteredModels = () => {
        const selectedBrand = brandFilter.value || "all";
        const selectedBodyType = bodyFilter.value || "all";
        const query = modelSearch.value.trim().toLowerCase();

        return models.filter((model) => {
            const matchesBrand = selectedBrand === "all" || model.brandId === selectedBrand;
            const matchesBodyType = selectedBodyType === "all" || model.bodyType === selectedBodyType;
            const matchesQuery = !query || model.name.toLowerCase().includes(query);
            return matchesBrand && matchesBodyType && matchesQuery;
        });
    };

    const populateSelects = () => {
        const bodyTypes = ["all", ...new Set(models.map((model) => model.bodyType))];

        brandFilter.innerHTML = ['<option value="all">All brands</option>']
            .concat(brands.map((brand) => `<option value="${brand.id}">${brand.name}</option>`))
            .join("");

        bodyFilter.innerHTML = bodyTypes
            .map((type) => `<option value="${type}">${type === "all" ? "All body types" : type}</option>`)
            .join("");
    };

    const renderBrandDetail = (filteredModels) => {
        const currentBrand = getSelectedBrand();

        if (!currentBrand) {
            const brandHighlights = brands.slice(0, 3).map((brand) => `
                <div class="detail-box">
                    <strong>${brand.name}</strong>
                    <span>${brand.country}</span>
                </div>
            `).join("");

            brandDetail.innerHTML = `
                <div class="brand-summary">
                    <div class="brand-title">
                        <h4>Global marque overview</h4>
                        <span class="brand-pill">${brands.length} marques</span>
                    </div>
                    <p>The Auto Atlas brings together legendary manufacturers spanning Europe, North America, Asia, and beyond.</p>
                    <div class="detail-grid">
                        ${brandHighlights}
                    </div>
                    <p><strong>Visible models:</strong> ${filteredModels.length}</p>
                </div>
            `;
            return;
        }

        const brandModels = filteredModels.filter((model) => model.brandId === currentBrand.id);

        brandDetail.innerHTML = `
            <div class="brand-summary">
                <div class="brand-title">
                    <h4>${currentBrand.name}</h4>
                    <span class="brand-pill">${brandModels.length} models</span>
                </div>
                <p>${currentBrand.description}</p>
                <div class="detail-grid">
                    <div class="detail-box">
                        <strong>Country</strong>
                        <span>${currentBrand.country}</span>
                    </div>
                    <div class="detail-box">
                        <strong>Founded</strong>
                        <span>${currentBrand.founded}</span>
                    </div>
                </div>
            </div>
        `;
    };

    const renderModelDetail = (filteredModels) => {
        const activeModel = filteredModels.find((model) => model.name === selectedModelName) || filteredModels[0] || null;

        if (!activeModel) {
            modelDetail.innerHTML = '<div class="empty-state">No model details available for the current selection.</div>';
            return;
        }

        const brand = brands.find((item) => item.id === activeModel.brandId);
        selectedModelName = activeModel.name;

        modelDetail.innerHTML = `
            <div class="brand-summary">
                <div class="brand-title">
                    <h4>${activeModel.name}</h4>
                    <span class="model-pill">${activeModel.bodyType}</span>
                </div>
                <p>${activeModel.description}</p>
                <div class="detail-grid">
                    <div class="detail-box">
                        <strong>Brand</strong>
                        <span>${brand ? brand.name : "Unknown"}</span>
                    </div>
                    <div class="detail-box">
                        <strong>Years</strong>
                        <span>${activeModel.years}</span>
                    </div>
                    <div class="detail-box">
                        <strong>Body type</strong>
                        <span>${activeModel.bodyType}</span>
                    </div>
                    <div class="detail-box">
                        <strong>Country</strong>
                        <span>${brand ? brand.country : "N/A"}</span>
                    </div>
                </div>
            </div>
        `;
    };

    const renderBrandGrid = () => {
        const selectedBrand = brandFilter.value || "all";

        brandGrid.innerHTML = brands.map((brand) => {
            const isSelected = selectedBrand === brand.id;
            return `
                <button class="brand-card ${isSelected ? "selected" : ""}" data-brand="${brand.id}" type="button">
                    <p class="brand-name">${brand.name}</p>
                    <p class="brand-country">${brand.country}</p>
                </button>
            `;
        }).join("");

        brandGrid.querySelectorAll(".brand-card").forEach((buttonNode) => {
            buttonNode.addEventListener("click", () => {
                brandFilter.value = buttonNode.dataset.brand;
                const currentFiltered = getFilteredModels();
                if (currentFiltered.length) {
                    selectedModelName = currentFiltered[0].name;
                }
                renderAll();
            });
        });
    };

    const updateStats = (filteredModels) => {
        const uniqueBodyTypes = new Set(filteredModels.map((model) => model.bodyType)).size;
        const uniqueBrands = new Set(filteredModels.map((model) => model.brandId)).size;

        brandTotal.textContent = brands.length;
        modelTotal.textContent = filteredModels.length;
        bodyTotal.textContent = uniqueBodyTypes;

        if (brandFilter.value !== "all") {
            brandTotal.textContent = uniqueBrands || 0;
        }
    };

    const renderModelList = () => {
        const filteredModels = getFilteredModels();

        if (!filteredModels.length) {
            modelList.innerHTML = '<div class="empty-state">No models match the current filters.</div>';
            updateStats(filteredModels);
            renderBrandDetail(filteredModels);
            renderModelDetail(filteredModels);
            return;
        }

        if (!selectedModelName || !filteredModels.some((model) => model.name === selectedModelName)) {
            selectedModelName = filteredModels[0].name;
        }

        modelList.innerHTML = filteredModels.map((model) => {
            const brand = brands.find((item) => item.id === model.brandId);
            const brandLabel = brand ? brand.name : "Unknown brand";
            const isSelected = model.name === selectedModelName;

            return `
                <article class="model-card ${isSelected ? "selected" : ""}" data-model="${model.name}" tabindex="0">
                    <h4>${model.name}</h4>
                    <div class="model-meta">
                        <span class="tag">${brandLabel}</span>
                        <span class="tag">${model.bodyType}</span>
                    </div>
                    <p><strong>Years:</strong> ${model.years}</p>
                    <p>${model.description}</p>
                </article>
            `;
        }).join("");

        modelList.querySelectorAll(".model-card").forEach((cardNode) => {
            cardNode.addEventListener("click", () => {
                selectedModelName = cardNode.dataset.model;
                renderModelDetail(filteredModels);
                renderModelList();
            });
        });

        updateStats(filteredModels);
        renderBrandDetail(filteredModels);
        renderModelDetail(filteredModels);
    };

    const renderAll = () => {
        const filteredModels = getFilteredModels();
        renderGallery();
        renderBrandGrid();
        renderModelList();
        updateStats(filteredModels);
    };

    populateSelects();
    renderAll();

    brandFilter.addEventListener("change", () => {
        const filteredModels = getFilteredModels();
        if (filteredModels.length) {
            selectedModelName = filteredModels[0].name;
        }
        renderAll();
    });

    bodyFilter.addEventListener("change", () => {
        const filteredModels = getFilteredModels();
        if (filteredModels.length) {
            selectedModelName = filteredModels[0].name;
        }
        renderAll();
    });

    modelSearch.addEventListener("input", () => {
        const filteredModels = getFilteredModels();
        if (filteredModels.length) {
            selectedModelName = filteredModels[0].name;
        }
        renderAll();
    });

    clearFiltersButton.addEventListener("click", () => {
        brandFilter.value = "all";
        bodyFilter.value = "all";
        modelSearch.value = "";
        selectedModelName = "";
        renderAll();
    });
}

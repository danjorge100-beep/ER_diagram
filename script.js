```javascript
/* ============================================
   SCHOOL PAYMENT SYSTEM
   ER DIAGRAM JAVASCRIPT
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {

    const diagram = document.getElementById("diagram");
    const wrapper = document.querySelector(".diagram-wrapper");
    const svg = document.getElementById("relationshipSvg");

    const zoomInBtn = document.getElementById("zoomInBtn");
    const zoomOutBtn = document.getElementById("zoomOutBtn");
    const resetBtn = document.getElementById("resetBtn");
    const zoomLevel = document.getElementById("zoomLevel");


    /* =========================================
       ZOOM
       ========================================= */

    let scale = 1;

    const MIN_SCALE = 0.5;
    const MAX_SCALE = 1.8;
    const ZOOM_STEP = 0.1;


    function updateZoom() {

        diagram.style.transform = `scale(${scale})`;

        zoomLevel.textContent =
            `${Math.round(scale * 100)}%`;

        drawRelationships();
    }


    zoomInBtn.addEventListener("click", () => {

        scale = Math.min(
            MAX_SCALE,
            Number((scale + ZOOM_STEP).toFixed(2))
        );

        updateZoom();
    });


    zoomOutBtn.addEventListener("click", () => {

        scale = Math.max(
            MIN_SCALE,
            Number((scale - ZOOM_STEP).toFixed(2))
        );

        updateZoom();
    });


    resetBtn.addEventListener("click", () => {

        scale = 1;

        diagram.style.transform =
            "translate(0px, 0px) scale(1)";

        updateZoom();

        wrapper.scrollTo({
            left: 0,
            top: 0,
            behavior: "smooth"
        });
    });


    /* =========================================
       MOUSE WHEEL ZOOM
       ========================================= */

    wrapper.addEventListener(
        "wheel",
        (event) => {

            if (!event.ctrlKey) {
                return;
            }

            event.preventDefault();

            if (event.deltaY < 0) {

                scale = Math.min(
                    MAX_SCALE,
                    Number((scale + ZOOM_STEP).toFixed(2))
                );

            } else {

                scale = Math.max(
                    MIN_SCALE,
                    Number((scale - ZOOM_STEP).toFixed(2))
                );
            }

            updateZoom();
        },
        { passive: false }
    );


    /* =========================================
       RELATIONSHIP DEFINITIONS
       ========================================= */

    const relationships = [

        {
            from: "students",
            to: "profiles",
            label: "profile_id → id",
            cardinality: "1 : 0..1"
        },

        {
            from: "student_fees",
            to: "students",
            label: "student_id → student_id",
            cardinality: "N : 1"
        },

        {
            from: "student_fees",
            to: "fee_types",
            label: "fee_type_id → fee_type_id",
            cardinality: "N : 1"
        },

        {
            from: "payments",
            to: "students",
            label: "student_id → student_id",
            cardinality: "N : 1"
        },

        {
            from: "payments",
            to: "profiles",
            label: "cashier_id → id",
            cardinality: "N : 1"
        },

        {
            from: "payment_items",
            to: "payments",
            label: "payment_id → payment_id",
            cardinality: "N : 1"
        },

        {
            from: "payment_items",
            to: "student_fees",
            label: "student_fee_id → student_fee_id",
            cardinality: "N : 1"
        }

    ];


    /* =========================================
       GET ENTITY CENTER
       ========================================= */

    function getEntityPoint(id, side) {

        const element =
            document.getElementById(id);

        if (!element) {
            return null;
        }

        const x = element.offsetLeft;
        const y = element.offsetTop;

        const width = element.offsetWidth;
        const height = element.offsetHeight;

        switch (side) {

            case "left":
                return {
                    x: x,
                    y: y + height / 2
                };

            case "right":
                return {
                    x: x + width,
                    y: y + height / 2
                };

            case "top":
                return {
                    x: x + width / 2,
                    y: y
                };

            case "bottom":
                return {
                    x: x + width / 2,
                    y: y + height
                };

            default:
                return {
                    x: x + width / 2,
                    y: y + height / 2
                };
        }
    }


    /* =========================================
       DETERMINE BEST CONNECTION SIDES
       ========================================= */

    function getConnectionPoints(fromElement, toElement) {

        const fromX =
            fromElement.offsetLeft +
            fromElement.offsetWidth / 2;

        const fromY =
            fromElement.offsetTop +
            fromElement.offsetHeight / 2;

        const toX =
            toElement.offsetLeft +
            toElement.offsetWidth / 2;

        const toY =
            toElement.offsetTop +
            toElement.offsetHeight / 2;

        const dx = toX - fromX;
        const dy = toY - fromY;

        let fromSide;
        let toSide;

        if (Math.abs(dx) > Math.abs(dy)) {

            if (dx > 0) {

                fromSide = "right";
                toSide = "left";

            } else {

                fromSide = "left";
                toSide = "right";
            }

        } else {

            if (dy > 0) {

                fromSide = "bottom";
                toSide = "top";

            } else {

                fromSide = "top";
                toSide = "bottom";
            }
        }

        return {
            from: getEntityPoint(
                fromElement.id,
                fromSide
            ),

            to: getEntityPoint(
                toElement.id,
                toSide
            )
        };
    }


    /* =========================================
       CREATE SVG ELEMENT
       ========================================= */

    function createSvgElement(
        type,
        attributes
    ) {

        const element =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                type
            );

        Object.entries(attributes)
            .forEach(([key, value]) => {

                element.setAttribute(
                    key,
                    value
                );

            });

        return element;
    }


    /* =========================================
       DRAW RELATIONSHIPS
       ========================================= */

    function drawRelationships() {

        /*
         * Remove everything except the SVG defs.
         */
        while (svg.children.length > 1) {
            svg.removeChild(
                svg.lastChild
            );
        }


        relationships.forEach(
            (relationship) => {

                const fromElement =
                    document.getElementById(
                        relationship.from
                    );

                const toElement =
                    document.getElementById(
                        relationship.to
                    );

                if (
                    !fromElement ||
                    !toElement
                ) {
                    return;
                }


                const points =
                    getConnectionPoints(
                        fromElement,
                        toElement
                    );


                if (!points.from || !points.to) {
                    return;
                }


                const x1 = points.from.x;
                const y1 = points.from.y;

                const x2 = points.to.x;
                const y2 = points.to.y;


                /*
                 * Create a slightly curved path
                 * instead of a simple straight line.
                 */

                const dx = x2 - x1;
                const dy = y2 - y1;

                let pathData;


                if (Math.abs(dx) > Math.abs(dy)) {

                    const curve =
                        Math.max(
                            50,
                            Math.abs(dx) * 0.35
                        );

                    const controlX =
                        x1 + (dx > 0 ? curve : -curve);

                    pathData =
                        `M ${x1} ${y1}
                         C ${controlX} ${y1},
                           ${x2 - (dx > 0 ? curve : -curve)} ${y2},
                           ${x2} ${y2}`;

                } else {

                    const curve =
                        Math.max(
                            50,
                            Math.abs(dy) * 0.35
                        );

                    const controlY =
                        y1 + (dy > 0 ? curve : -curve);

                    pathData =
                        `M ${x1} ${y1}
                         C ${x1} ${controlY},
                           ${x2} ${y2 - (dy > 0 ? curve : -curve)},
                           ${x2} ${y2}`;
                }


                const path =
                    createSvgElement(
                        "path",
                        {
                            d: pathData,
                            "marker-end":
                                "url(#arrow)"
                        }
                    );


                svg.appendChild(path);


                /*
                 * Relationship label
                 */

                const labelX =
                    (x1 + x2) / 2;

                const labelY =
                    (y1 + y2) / 2 - 8;


                const text =
                    createSvgElement(
                        "text",
                        {
                            x: labelX,
                            y: labelY,
                            class: "relationship-label",
                            "text-anchor": "middle"
                        }
                    );


                text.textContent =
                    relationship.cardinality;


                svg.appendChild(text);

            }
        );
    }


    /* =========================================
       DRAG / PAN
       ========================================= */

    let isDragging = false;

    let startX = 0;
    let startY = 0;

    let scrollLeft = 0;
    let scrollTop = 0;


    wrapper.addEventListener(
        "mousedown",
        (event) => {

            /*
             * Don't start dragging when clicking
             * on a button or entity.
             */

            if (
                event.target.closest(
                    ".entity, button"
                )
            ) {
                return;
            }

            isDragging = true;

            startX = event.pageX;
            startY = event.pageY;

            scrollLeft = wrapper.scrollLeft;
            scrollTop = wrapper.scrollTop;

            wrapper.style.cursor = "grabbing";
        }
    );


    wrapper.addEventListener(
        "mousemove",
        (event) => {

            if (!isDragging) {
                return;
            }

            const x =
                event.pageX - startX;

            const y =
                event.pageY - startY;

            wrapper.scrollLeft =
                scrollLeft - x;

            wrapper.scrollTop =
                scrollTop - y;
        }
    );


    function stopDragging() {

        isDragging = false;

        wrapper.style.cursor = "grab";
    }


    wrapper.addEventListener(
        "mouseup",
        stopDragging
    );

    wrapper.addEventListener(
        "mouseleave",
        stopDragging
    );


    /* =========================================
       ENTITY HIGHLIGHTING
       ========================================= */

    document
        .querySelectorAll(".entity")
        .forEach((entity) => {

            entity.addEventListener(
                "mouseenter",
                () => {

                    const tableName =
                        entity.dataset.table;

                    relationships.forEach(
                        (relationship) => {

                            if (
                                relationship.from === tableName ||
                                relationship.to === tableName
                            ) {

                                entity.classList.add(
                                    "relationship-active"
                                );
                            }

                        }
                    );
                }
            );


            entity.addEventListener(
                "mouseleave",
                () => {

                    entity.classList.remove(
                        "relationship-active"
                    );
                }
            );

        });


    /* =========================================
       KEYBOARD SHORTCUTS
       ========================================= */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.ctrlKey &&
                event.key === "+"
            ) {

                event.preventDefault();

                scale = Math.min(
                    MAX_SCALE,
                    Number(
                        (
                            scale +
                            ZOOM_STEP
                        ).toFixed(2)
                    )
                );

                updateZoom();
            }


            if (
                event.ctrlKey &&
                event.key === "-"
            ) {

                event.preventDefault();

                scale = Math.max(
                    MIN_SCALE,
                    Number(
                        (
                            scale -
                            ZOOM_STEP
                        ).toFixed(2)
                    )
                );

                updateZoom();
            }


            if (
                event.key === "0"
            ) {

                scale = 1;

                updateZoom();
            }

        }
    );


    /* =========================================
       INITIALIZE
       ========================================= */

    function initialize() {

        updateZoom();

        /*
         * Draw again after fonts/layout settle.
         */

        setTimeout(
            drawRelationships,
            100
        );

        setTimeout(
            drawRelationships,
            500
        );
    }


    window.addEventListener(
        "resize",
        drawRelationships
    );


    initialize();

});
```

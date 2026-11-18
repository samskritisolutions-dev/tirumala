import os
from PIL import Image
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    # 16:9 widescreen presentation (13.333 x 7.5 inches)
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Brand Colors directly from logo
    PRIMARY_BLUE   = RGBColor(11, 75, 183)     # #0B4BB7 Royal Blue
    DARK_NAVY      = RGBColor(10, 25, 47)      # #0A192F Dark Slate Navy
    SECONDARY_NAVY = RGBColor(17, 34, 64)      # #112240
    ACCENT_GOLD    = RGBColor(245, 166, 35)    # #F5A623 Architectural Amber Gold
    GOLD_LIGHT     = RGBColor(254, 243, 199)   # #FEF3C7
    BG_LIGHT       = RGBColor(248, 250, 252)   # #F8FAFC
    CARD_BG        = RGBColor(255, 255, 255)   # #FFFFFF
    TEXT_DARK      = RGBColor(15, 23, 42)      # #0F172A
    TEXT_MUTED     = RGBColor(100, 116, 139)   # #64748B
    TEXT_WHITE     = RGBColor(255, 255, 255)
    BORDER_COLOR   = RGBColor(226, 232, 240)   # #E2E8F0
    BLUE_LIGHT     = RGBColor(238, 244, 255)   # #EEF4FF
    GREEN_SUCCESS  = RGBColor(16, 185, 129)    # #10B981

    LOGO_PATH = os.path.abspath("images/tirumala-nirmaan-logo.png")

    def set_shape_flat(shape, fill_color, line_color=None, line_width=1):
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill_color
        if line_color:
            shape.line.color.rgb = line_color
            shape.line.width = Pt(line_width)
        else:
            shape.line.fill.background()

    def add_fitted_picture(slide, img_path, box_left, box_top, box_w, box_h, bg_color=None, border_color=None):
        """
        Guarantees that an image or logo is NEVER stretched and NEVER cropped.
        Calculates exact aspect ratio from PIL image and centers it perfectly inside the bounding box.
        """
        if not os.path.exists(img_path):
            return None

        # Draw neat background card if specified
        if bg_color or border_color:
            bg_rect = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, box_left, box_top, box_w, box_h)
            set_shape_flat(bg_rect, bg_color or CARD_BG, border_color, 1)

        with Image.open(img_path) as im:
            orig_w, orig_h = im.size

        aspect_img = orig_w / orig_h
        aspect_box = float(box_w) / float(box_h)

        if aspect_img > aspect_box:
            # Constrained by width
            fit_w = box_w
            fit_h = Inches(float(box_w.inches) / aspect_img)
            fit_left = box_left
            fit_top = box_top + Inches((float(box_h.inches) - float(fit_h.inches)) / 2)
        else:
            # Constrained by height
            fit_h = box_h
            fit_w = Inches(float(box_h.inches) * aspect_img)
            fit_left = box_left + Inches((float(box_w.inches) - float(fit_w.inches)) / 2)
            fit_top = box_top

        return slide.shapes.add_picture(img_path, fit_left, fit_top, width=fit_w, height=fit_h)

    def add_header(slide, title, category, slide_num, total_slides=15):
        # Header background banner
        header_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(1.18))
        set_shape_flat(header_bar, CARD_BG, BORDER_COLOR, 1)

        # Gold accent stripe
        gold_stripe = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.15), Inches(13.333), Inches(0.04))
        set_shape_flat(gold_stripe, ACCENT_GOLD)

        # Logo placed in an EXACT 1:1 SQUARE box (No stretching)
        if os.path.exists(LOGO_PATH):
            add_fitted_picture(slide, LOGO_PATH, Inches(0.6), Inches(0.12), Inches(0.95), Inches(0.95))

        # Brand text next to square logo
        brand_box = slide.shapes.add_textbox(Inches(1.68), Inches(0.2), Inches(2.2), Inches(0.8))
        btf = brand_box.text_frame
        btf.margin_top = btf.margin_left = btf.margin_bottom = btf.margin_right = 0
        bp1 = btf.paragraphs[0]
        bp1.text = "TIRUMALA NIRMAAN"
        bp1.font.name = "Segoe UI"
        bp1.font.size = Pt(11)
        bp1.font.bold = True
        bp1.font.color.rgb = PRIMARY_BLUE
        bp2 = btf.add_paragraph()
        bp2.text = "STRONG FOUNDATIONS. LASTING HOMES."
        bp2.font.name = "Segoe UI"
        bp2.font.size = Pt(7.5)
        bp2.font.color.rgb = ACCENT_GOLD

        # Slide Title text box
        tb = slide.shapes.add_textbox(Inches(4.1), Inches(0.18), Inches(6.5), Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = "Segoe UI"
        p.font.size = Pt(20)
        p.font.bold = True
        p.font.color.rgb = PRIMARY_BLUE

        # Category pill
        if category:
            cat_shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(10.8), Inches(0.35), Inches(2.0), Inches(0.42))
            set_shape_flat(cat_shape, BLUE_LIGHT, PRIMARY_BLUE, 1)
            cat_tf = cat_shape.text_frame
            cat_p = cat_tf.paragraphs[0]
            cat_p.text = category.upper()
            cat_p.alignment = PP_ALIGN.CENTER
            cat_p.font.name = "Segoe UI"
            cat_p.font.size = Pt(9)
            cat_p.font.bold = True
            cat_p.font.color.rgb = PRIMARY_BLUE

        # Footer bar
        footer = slide.shapes.add_textbox(Inches(0.6), Inches(7.12), Inches(12.133), Inches(0.32))
        ftf = footer.text_frame
        ftf.margin_top = ftf.margin_left = 0
        fp = ftf.paragraphs[0]
        fp.text = f"Tirumala Nirmaan  |  Hyderabad Premium Real Estate Portfolio  |  Page {slide_num} of {total_slides}"
        fp.font.name = "Segoe UI"
        fp.font.size = Pt(9)
        fp.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 1: COVER SLIDE (Dark Luxury Widescreen)
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)
    bg1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    set_shape_flat(bg1, DARK_NAVY)

    # Gold accent stripe at bottom
    bar1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(7.32), Inches(13.333), Inches(0.18))
    set_shape_flat(bar1, ACCENT_GOLD)

    # Pill badge
    bar2 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.85), Inches(2.8), Inches(0.4))
    set_shape_flat(bar2, SECONDARY_NAVY, ACCENT_GOLD, 1)
    b2_tf = bar2.text_frame
    b2_p = b2_tf.paragraphs[0]
    b2_p.text = "OFFICIAL PROJECTS DOSSIER 2026"
    b2_p.alignment = PP_ALIGN.CENTER
    b2_p.font.name = "Segoe UI"
    b2_p.font.size = Pt(9.5)
    b2_p.font.bold = True
    b2_p.font.color.rgb = ACCENT_GOLD

    # LOGO: Placed in a pure 1:1 SQUARE frame with white card backing (NO STRETCH)
    logo_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.45), Inches(2.2), Inches(2.2))
    set_shape_flat(logo_card, CARD_BG, None)
    if os.path.exists(LOGO_PATH):
        add_fitted_picture(slide1, LOGO_PATH, Inches(0.9), Inches(1.55), Inches(2.0), Inches(2.0))

    # Headline text next to the square logo
    head_box = slide1.shapes.add_textbox(Inches(3.3), Inches(1.45), Inches(4.3), Inches(2.2))
    htf = head_box.text_frame
    htf.word_wrap = True
    htf.margin_top = htf.margin_left = 0
    hp1 = htf.paragraphs[0]
    hp1.text = "TIRUMALA NIRMAAN"
    hp1.font.name = "Segoe UI"
    hp1.font.size = Pt(28)
    hp1.font.bold = True
    hp1.font.color.rgb = TEXT_WHITE
    
    hp2 = htf.add_paragraph()
    hp2.text = "STRONG FOUNDATIONS . LASTING HOMES"
    hp2.font.name = "Segoe UI"
    hp2.font.size = Pt(13)
    hp2.font.bold = True
    hp2.font.color.rgb = ACCENT_GOLD
    hp2.space_before = Pt(4)

    hp3 = htf.add_paragraph()
    hp3.text = "A visionary real estate portfolio delivering premier living communities across Hyderabad's Eastern Growth Corridors."
    hp3.font.name = "Segoe UI"
    hp3.font.size = Pt(11)
    hp3.font.color.rgb = RGBColor(203, 213, 225)
    hp3.space_before = Pt(8)

    # AI Generated Cover Hero visual on right (FITTED PROPORTIONALLY - NO CROP, NO STRETCH)
    cover_img = os.path.abspath("images/projects/ai-grandeur-towers.jpg")
    if not os.path.exists(cover_img):
        cover_img = os.path.abspath("images/projects/ai-sv-heights.jpg")
    
    hero_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.8), Inches(0.85), Inches(4.8), Inches(5.8))
    set_shape_flat(hero_card, SECONDARY_NAVY, BORDER_COLOR, 1)
    add_fitted_picture(slide1, cover_img, Inches(7.9), Inches(0.95), Inches(4.6), Inches(5.6))

    # Cover Quick Stats Box
    stat_box = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.0), Inches(6.7), Inches(2.65))
    set_shape_flat(stat_box, SECONDARY_NAVY, PRIMARY_BLUE, 1)
    stf = stat_box.text_frame
    stf.word_wrap = True
    stf.margin_top = Inches(0.25)
    stf.margin_left = stf.margin_right = Inches(0.3)
    
    sp0 = stf.paragraphs[0]
    sp0.text = "PROVEN TRACK RECORD IN HYDERABAD"
    sp0.font.name = "Segoe UI"
    sp0.font.size = Pt(11)
    sp0.font.bold = True
    sp0.font.color.rgb = ACCENT_GOLD

    sp1 = stf.add_paragraph()
    sp1.text = "★ 20+ Years Excellence in Residential & Commercial Real Estate\n★ 25+ Completed & Successfully Handed Over Landmarks\n★ 1.5 Million+ Sq. Ft. Built Area with 100% Vaastu Compliance\n★ 1,500+ Happy Families Living in Thriving Communities"
    sp1.font.name = "Segoe UI"
    sp1.font.size = Pt(11.5)
    sp1.font.color.rgb = TEXT_WHITE
    sp1.space_before = Pt(6)

    sp2 = stf.add_paragraph()
    sp2.text = "Approved by GHMC & HMDA  •  RERA Certified  •  Pre-Approved Loans by SBI, HDFC, ICICI, LIC"
    sp2.font.name = "Segoe UI"
    sp2.font.size = Pt(9.5)
    sp2.font.color.rgb = RGBColor(148, 163, 184)
    sp2.space_before = Pt(8)

    # ==========================================
    # SLIDE 2: COMPANY OVERVIEW
    # ==========================================
    slide2 = prs.slides.add_slide(blank_layout)
    bg2 = slide2.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    set_shape_flat(bg2, BG_LIGHT)
    add_header(slide2, "Company Overview & Strategic Vision", "About Us", 2)

    c1 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(5.6), Inches(5.4))
    set_shape_flat(c1, CARD_BG, BORDER_COLOR, 1)
    c1_tf = c1.text_frame
    c1_tf.word_wrap = True
    c1_tf.margin_left = c1_tf.margin_top = Inches(0.35)
    c1_tf.margin_right = Inches(0.35)

    cp = c1_tf.paragraphs[0]
    cp.text = "Building Trust, Elevating Lifestyles"
    cp.font.name = "Segoe UI"
    cp.font.size = Pt(18)
    cp.font.bold = True
    cp.font.color.rgb = PRIMARY_BLUE

    paras = [
        ("Decades of Architectural Mastery", "Tirumala Nirmaan has established an indelible legacy in Hyderabad's premier real estate sector. With over 2 decades of focused property development, we turn architectural visions into landmark communities."),
        ("Precision Engineering & Zero Compromise", "Every project adheres strictly to premium seismic zone structural standards, Grade-A TMT steel, ready-mix concrete, and German-engineered fittings."),
        ("Vastu-Compliant Sanctums", "100% compliant with authentic ancient Vastu principles—optimizing natural airflow, sunlight, positive energy, and spatial tranquility."),
        ("Clear Legal Titles & Transparent Governance", "Zero legal ambiguities. Fully sanctioned by GHMC, HMDA, and RERA authorities with pre-approved project loans from all top financial institutions.")
    ]
    for subtitle, desc in paras:
        sp = c1_tf.add_paragraph()
        sp.text = f"• {subtitle}: "
        sp.font.bold = True
        sp.font.size = Pt(11)
        sp.font.color.rgb = TEXT_DARK
        sp.space_before = Pt(8)
        run = sp.add_run()
        run.text = desc
        run.font.bold = False
        run.font.size = Pt(10.5)
        run.font.color.rgb = TEXT_MUTED

    metrics = [
        ("20+", "Years of Excellence", "Continuously shaping Eastern Hyderabad's skyline since inception.", ACCENT_GOLD),
        ("25+", "Completed Landmarks", "Successfully delivered residential towers and commercial hubs.", PRIMARY_BLUE),
        ("1.5M+", "Sq. Ft. Constructed", "Superior quality constructed area delivered on scheduled time.", PRIMARY_BLUE),
        ("1,500+", "Delighted Families", "Thriving communities enjoying enduring lifestyle value.", GREEN_SUCCESS),
    ]

    for idx, (num, lbl, desc, col) in enumerate(metrics):
        r = idx // 2
        c = idx % 2
        card_x = Inches(6.7 + c * 2.95)
        card_y = Inches(1.4 + r * 2.65)
        sc = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, card_x, card_y, Inches(2.8), Inches(2.45))
        set_shape_flat(sc, CARD_BG, BORDER_COLOR, 1)
        accent = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, card_x, card_y, Inches(2.8), Inches(0.12))
        set_shape_flat(accent, col)

        sctf = sc.text_frame
        sctf.word_wrap = True
        sctf.margin_top = Inches(0.3)
        sctf.margin_left = sctf.margin_right = Inches(0.2)
        
        np = sctf.paragraphs[0]
        np.text = num
        np.alignment = PP_ALIGN.CENTER
        np.font.name = "Segoe UI"
        np.font.size = Pt(32)
        np.font.bold = True
        np.font.color.rgb = col

        lp = sctf.add_paragraph()
        lp.text = lbl
        lp.alignment = PP_ALIGN.CENTER
        lp.font.name = "Segoe UI"
        lp.font.size = Pt(12)
        lp.font.bold = True
        lp.font.color.rgb = TEXT_DARK

        dp = sctf.add_paragraph()
        dp.text = desc
        dp.alignment = PP_ALIGN.CENTER
        dp.font.name = "Segoe UI"
        dp.font.size = Pt(9.5)
        dp.font.color.rgb = TEXT_MUTED
        dp.space_before = Pt(4)

    # ==========================================
    # SLIDE 3: STRATEGIC PORTFOLIO SPECTRUM
    # ==========================================
    slide3 = prs.slides.add_slide(blank_layout)
    bg3 = slide3.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    set_shape_flat(bg3, BG_LIGHT)
    add_header(slide3, "Our Comprehensive Real Estate Portfolio", "Portfolio Architecture", 3)

    pillars = [
        ("ONGOING RESIDENTIAL", "3 Active Flagships", [
            ("SV Heights", "Nagole Metro Junction (2 & 3 BHK)"),
            ("SSV Padma Heights", "Peerzadiguda / Uppal Depot (2 & 3 BHK)"),
            ("SSV Krishna Heights", "Parvathapur Corridor (Modern 2 & 3 BHK)")
        ], PRIMARY_BLUE, "Fast-tracked construction with high capital appreciation."),
        ("UPCOMING SIGNATURES", "Pre-Launch Enclaves", [
            ("Thirumala Elite Meadows", "Pocharam / Ghatkesar (Luxury Duplex Villas)"),
            ("SSV Grandeur Towers", "Boduppal-Peerzadiguda Link Rd (High-Rise)"),
            ("Future Growth Parcels", "Strategic landbanks across East Hyderabad")
        ], ACCENT_GOLD, "Next-generation gated architecture with lifestyle clubhouse."),
        ("COMMERCIAL SPACES", "High-Yield Retail", [
            ("D-Mart Commercial Complex", "Ramanthapur Main Commercial Arterial"),
            ("SV's Manik Arcade", "Bulkampet / Ameerpet Business Core"),
            ("High-Footfall Retails", "Strategic ground-floor prime shops")
        ], PRIMARY_BLUE, "Prime commercial hubs with strong rental yields."),
        ("DELIVERED COMMUNITIES", "25+ Landmarks", [
            ("Thirumala Towers Series", "Boduppal, Medipally, Ramanthapur"),
            ("60 Independent Houses", "Balaji Hills & Rajeshekar Colony"),
            ("Keshav's Residencies", "Chilakanagar & NTR Circle Boduppal")
        ], GREEN_SUCCESS, "100% occupied thriving neighborhoods with verified titles.")
    ]

    for i, (title, count, items, col, note) in enumerate(pillars):
        px = Inches(0.8 + i * 2.95)
        pcard = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, Inches(1.4), Inches(2.8), Inches(5.4))
        set_shape_flat(pcard, CARD_BG, BORDER_COLOR, 1)
        pbar = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, Inches(1.4), Inches(2.8), Inches(0.12))
        set_shape_flat(pbar, col)

        ptf = pcard.text_frame
        ptf.word_wrap = True
        ptf.margin_top = Inches(0.3)
        ptf.margin_left = ptf.margin_right = Inches(0.2)

        p1 = ptf.paragraphs[0]
        p1.text = title
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = col

        p2 = ptf.add_paragraph()
        p2.text = count
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(11)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_DARK
        p2.space_before = Pt(3)

        div = ptf.add_paragraph()
        div.text = "─────────────────"
        div.font.size = Pt(8)
        div.font.color.rgb = BORDER_COLOR
        div.space_before = Pt(4)

        for proj, det in items:
            pr = ptf.add_paragraph()
            pr.text = f"★ {proj}"
            pr.font.name = "Segoe UI"
            pr.font.size = Pt(10.5)
            pr.font.bold = True
            pr.font.color.rgb = TEXT_DARK
            pr.space_before = Pt(6)

            dr = ptf.add_paragraph()
            dr.text = det
            dr.font.name = "Segoe UI"
            dr.font.size = Pt(9)
            dr.font.color.rgb = TEXT_MUTED

        nt = ptf.add_paragraph()
        nt.text = f"\nNote: {note}"
        nt.font.name = "Segoe UI"
        nt.font.size = Pt(8.5)
        nt.font.italic = True
        nt.font.color.rgb = TEXT_MUTED

    # ========================================================
    # HELPER FOR SINGLE PROJECT SPOTLIGHT SLIDE (PROPORTIONAL FITTED IMAGES)
    # ========================================================
    def add_project_spotlight_slide(prs, p_num, title, tagline, category, location, rera_status, 
                                   img_path, specs, highlights, amenities, total_slides=15):
        s = prs.slides.add_slide(blank_layout)
        bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
        set_shape_flat(bg, BG_LIGHT)
        add_header(s, title, category, p_num, total_slides)

        # Left Column: Image Card & Specs
        img_card = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(5.6), Inches(5.4))
        set_shape_flat(img_card, CARD_BG, BORDER_COLOR, 1)

        # Fit image PROPORTIONALLY (no stretch, no crop!)
        if img_path and os.path.exists(img_path):
            add_fitted_picture(s, img_path, Inches(0.95), Inches(1.55), Inches(5.3), Inches(3.2), bg_color=DARK_NAVY)

        # Bottom specs ribbon inside Left Column
        spec_box = s.shapes.add_textbox(Inches(0.95), Inches(4.85), Inches(5.3), Inches(1.8))
        stf = spec_box.text_frame
        stf.word_wrap = True
        stf.margin_top = stf.margin_left = 0
        
        loc_p = stf.paragraphs[0]
        loc_p.text = f"📍 Location: {location}"
        loc_p.font.name = "Segoe UI"
        loc_p.font.size = Pt(11)
        loc_p.font.bold = True
        loc_p.font.color.rgb = PRIMARY_BLUE

        rera_p = stf.add_paragraph()
        rera_p.text = f"🏛️ Approval: {rera_status}"
        rera_p.font.name = "Segoe UI"
        rera_p.font.size = Pt(10)
        rera_p.font.bold = True
        rera_p.font.color.rgb = GREEN_SUCCESS
        rera_p.space_before = Pt(4)

        spec_p = stf.add_paragraph()
        spec_p.text = f"📐 Configurations: {specs}"
        spec_p.font.name = "Segoe UI"
        spec_p.font.size = Pt(10)
        spec_p.font.color.rgb = TEXT_DARK
        spec_p.space_before = Pt(4)

        # Right Column: Highlights & Amenities
        right_card = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.6), Inches(1.4), Inches(5.9), Inches(5.4))
        set_shape_flat(right_card, CARD_BG, BORDER_COLOR, 1)
        
        r_bar = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.6), Inches(1.4), Inches(5.9), Inches(0.12))
        set_shape_flat(r_bar, ACCENT_GOLD)

        rtf = right_card.text_frame
        rtf.word_wrap = True
        rtf.margin_top = Inches(0.3)
        rtf.margin_left = rtf.margin_right = Inches(0.35)

        h1 = rtf.paragraphs[0]
        h1.text = tagline
        h1.font.name = "Segoe UI"
        h1.font.size = Pt(16)
        h1.font.bold = True
        h1.font.color.rgb = PRIMARY_BLUE

        sec1 = rtf.add_paragraph()
        sec1.text = "Key Architectural & Location Highlights:"
        sec1.font.name = "Segoe UI"
        sec1.font.size = Pt(12)
        sec1.font.bold = True
        sec1.font.color.rgb = TEXT_DARK
        sec1.space_before = Pt(8)

        for hl in highlights:
            hp = rtf.add_paragraph()
            hp.text = f"✔  {hl}"
            hp.font.name = "Segoe UI"
            hp.font.size = Pt(10)
            hp.font.color.rgb = TEXT_MUTED
            hp.space_before = Pt(3)

        sec2 = rtf.add_paragraph()
        sec2.text = "Modern Amenities & Specifications:"
        sec2.font.name = "Segoe UI"
        sec2.font.size = Pt(12)
        sec2.font.bold = True
        sec2.font.color.rgb = ACCENT_GOLD
        sec2.space_before = Pt(10)

        for am in amenities:
            ap = rtf.add_paragraph()
            ap.text = f"★  {am}"
            ap.font.name = "Segoe UI"
            ap.font.size = Pt(10)
            ap.font.color.rgb = TEXT_MUTED
            ap.space_before = Pt(3)

    # ==========================================
    # SLIDE 4: SV HEIGHTS (AI Image)
    # ==========================================
    add_project_spotlight_slide(
        prs, p_num=4,
        title="SV Heights — Premium Living at Nagole",
        tagline="Sophisticated Urban Enclave with Seamless Metro Connectivity",
        category="Ongoing Residential",
        location="Nagole, Hyderabad (2 Mins from Inner Ring Road)",
        rera_status="GHMC Sanctioned | RERA Approved | SBI / HDFC Bank Approved",
        img_path=os.path.abspath("images/projects/ai-sv-heights.jpg"),
        specs="Spacious 2 & 3 BHK Luxury Apartments (1180 – 1650 Sq.Ft)",
        highlights=[
            "Strategic landmark location just minutes from Nagole Metro Station and Uppal Hub.",
            "Surrounded by reputed educational institutions, multi-specialty hospitals, and shopping zones.",
            "High rental yields and rapid capital appreciation due to the Eastern IT growth belt.",
            "100% Vastu-compliant layout designed for maximum natural cross-ventilation and daylight."
        ],
        amenities=[
            "High-speed automatic elevators with ARD emergency rescue system.",
            "100% DG power backup for common lighting, lifts, and essential water pumps.",
            "Covered stilt car parking with EV charging infrastructure readiness.",
            "24/7 round-the-clock CCTV surveillance, intercom, and multi-tier security gate.",
            "Rainwater harvesting pits and municipal water supply with deep borewell."
        ]
    )

    # ==========================================
    # SLIDE 5: SSV PADMA HEIGHTS (AI Image)
    # ==========================================
    add_project_spotlight_slide(
        prs, p_num=5,
        title="SSV Padma Heights — Peerzadiguda Enclave",
        tagline="Exclusive Tranquil Living Near Uppal Depot & Growth Corridor",
        category="Ongoing Residential",
        location="Peerzadiguda, Near Uppal Depot, Hyderabad",
        rera_status="HMDA Approved | RERA Registered | Clear Title 100%",
        img_path=os.path.abspath("images/projects/ai-ssv-padma-heights.jpg"),
        specs="Premium 2 & 3 BHK East and West Facing Vaastu Residences",
        highlights=[
            "Nestled in an ultra-peaceful residential zone with zero noise pollution yet immediate arterial access.",
            "Direct connectivity to Warangal Highway, Uppal Metro, and Pocharam Infosys campus.",
            "Generous balconies and wide corridors engineered for luxury privacy.",
            "Optimum structural design with earthquake-resistant RCC framed foundation."
        ],
        amenities=[
            "Branded 8-passenger automatic elevator with stainless steel finish.",
            "Dedicated landscaped rooftop terrace for resident community gatherings.",
            "Solar water heating points and eco-friendly exterior weather-proof coating.",
            "Granite lobby finishing, high-grade teakwood main doors, and UPVC sliding windows.",
            "24/7 manned security station with HD perimeter cameras."
        ]
    )

    # ==========================================
    # SLIDE 6: SSV KRISHNA HEIGHTS (AI Image)
    # ==========================================
    add_project_spotlight_slide(
        prs, p_num=6,
        title="SSV Krishna Heights — Modern Parvathapur",
        tagline="Architectural Brilliance Meeting Next-Gen Lifestyle Living",
        category="Ongoing Residential",
        location="Parvathapur, Peerzadiguda Belt, Hyderabad",
        rera_status="Fully Sanctioned | RERA Compliant | Bank Loan Ready",
        img_path=os.path.abspath("images/projects/ai-ssv-krishna-heights.jpg"),
        specs="Thoughtfully Crafted 2 & 3 BHK Homes with Zero Space Wastage",
        highlights=[
            "Located in the booming Parvathapur-Boduppal-Uppal triangle with rapid municipal expansion.",
            "Close proximity to top schools like DPS, Kendriya Vidyalaya, and leading engineering institutes.",
            "Superb capital growth corridor fueled by the Eastern Corridor infrastructure boom.",
            "Pristine groundwater, lush surroundings, and clear unblocked panoramic sunrise views."
        ],
        amenities=[
            "Continuous solar-powered common illumination ensuring low maintenance society fees.",
            "Comprehensive fire fighting system compliant with municipal fire safety norms.",
            "Individual water meter provisions and dual overhead tanks (Manjeera + Borewell).",
            "Concealed copper wiring with modular switches from Finolex / Havells.",
            "Children's safe play zone and senior citizen seating corners."
        ]
    )

    # ==========================================
    # SLIDE 7: THIRUMALA ELITE MEADOWS (AI Image)
    # ==========================================
    add_project_spotlight_slide(
        prs, p_num=7,
        title="Thirumala Elite Meadows — Gated Luxury Villas",
        tagline="Upcoming Signature Gated Duplex Villas with Private Green Enclaves",
        category="Upcoming Signature Enclave",
        location="Pocharam / Ghatkesar Growth Corridor (Near IT Raheja SEZ)",
        rera_status="Pre-Launch Phase | HMDA Layout Plan in Progress | Exclusive Booking",
        img_path=os.path.abspath("images/projects/ai-elite-meadows-villas.jpg"),
        specs="Grand 3 & 4 BHK Luxury Duplex Villas (2400 – 3500 Sq.Ft)",
        highlights=[
            "Strategically positioned near Raheja Mindspace IT Park, Infosys Pocharam, and ORR Exit 9.",
            "Boutique low-density gated community designed for bespoke privacy and exclusivity.",
            "Wide black-top internal avenue roads with designer street lights and underground cabling.",
            "Individual compound walls with private garden lawns and dual vehicle parking porch."
        ],
        amenities=[
            "Exclusive Residents Clubhouse featuring gym, indoor games, and banquet lounge.",
            "Jogging tracks, landscaped central parks, and reflexology walking pathway.",
            "Underground drainage (UGD) and dedicated water distribution network.",
            "Smart home automation ready wiring and centralized security gate with RFID boom barrier.",
            "Solar water heater on rooftop terrace and private EV charger socket."
        ]
    )

    # ==========================================
    # SLIDE 8: SSV GRANDEUR TOWERS (AI Image)
    # ==========================================
    add_project_spotlight_slide(
        prs, p_num=8,
        title="SSV Grandeur Towers — Sky-High Living",
        tagline="A Visionary High-Rise Residential Landmark Defining Boduppal-Peerzadiguda",
        category="Upcoming High-Rise",
        location="Boduppal – Peerzadiguda Link Road, Hyderabad",
        rera_status="Pre-Launch Planning | High-Rise Category | Express Interest Open",
        img_path=os.path.abspath("images/projects/ai-grandeur-towers.jpg"),
        specs="Grand 2.5 & 3 BHK High-Rise Residences with Panoramic Horizon Views",
        highlights=[
            "Iconic architectural elevation setting a brand-new skyline benchmark in East Hyderabad.",
            "Sprawling views over the urban green canopy with unmatched natural ventilation.",
            "Instant connection to Uppal Junction, Inner Ring Road, and Outer Ring Road corridors.",
            "Engineered with world-class Mivan/formwork high-durability construction technology."
        ],
        amenities=[
            "Sky Lounge on terrace level for stargazing, yoga, and evening community relaxations.",
            "Double-height grand entrance reception lobby with guest seating hospitality.",
            "Multi-tier 24/7 security with smart biometric access and video door phone integration.",
            "Covered multi-level basement car parking with automated sensor guidance.",
            "Infinity edge splash pool and fully equipped air-conditioned fitness studio."
        ]
    )

    # ==========================================
    # SLIDE 9: COMMERCIAL LANDMARKS (AI Image Fitted)
    # ==========================================
    slide9 = prs.slides.add_slide(blank_layout)
    bg9 = slide9.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    set_shape_flat(bg9, BG_LIGHT)
    add_header(slide9, "Landmark Commercial Properties", "Commercial Real Estate", 9)

    comms = [
        ("D-Mart Commercial Complex", "Ramanthapur Main Road, Hyderabad", "images/projects/ai-commercial-arcade.jpg",
         "Prime Arterial Commercial Anchor", "High-Footfall Retail Hub", [
             "Prime street-facing retail frontage with tremendous vehicular visibility.",
             "Anchored by D-Mart supermarket drawing thousands of daily shoppers.",
             "Spacious floor plates designed for retail outlets, banking halls, and diagnostics.",
             "Extensive customer parking and heavy commercial loading/unloading bays."
         ]),
        ("SV's Manik Arcade", "Bulkampet, Ameerpet, Hyderabad", "images/projects/sv-manik-arcade.jpg",
         "Central Business & Commercial Hub", "Corporate & Retail Complex", [
             "Situated in the beating commercial heart of Ameerpet-Bulkampet trade circle.",
             "Ideal for diagnostic centres, educational institutes, bank branches, and corporate offices.",
             "Robust structural layout with high floor-to-ceiling clearance.",
             "Guaranteed high occupancy rates and exceptional rental yields for commercial investors."
         ])
    ]

    for idx, (cname, cloc, cimg, ctag, cbadge, points) in enumerate(comms):
        cx = Inches(0.8 + idx * 5.9)
        ccard = slide9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, Inches(1.4), Inches(5.7), Inches(5.4))
        set_shape_flat(ccard, CARD_BG, BORDER_COLOR, 1)

        cbar = slide9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, Inches(1.4), Inches(5.7), Inches(0.12))
        set_shape_flat(cbar, PRIMARY_BLUE)

        # Image fitted proportionally (NO STRETCH, NO CROP)
        if os.path.exists(cimg):
            add_fitted_picture(slide9, cimg, Inches(0.95 + idx * 5.9), Inches(1.6), Inches(5.4), Inches(2.3), bg_color=DARK_NAVY)

        ctf = ccard.text_frame
        ctf.word_wrap = True
        ctf.margin_top = Inches(2.65)
        ctf.margin_left = ctf.margin_right = Inches(0.3)

        cp1 = ctf.paragraphs[0]
        cp1.text = cname
        cp1.font.name = "Segoe UI"
        cp1.font.size = Pt(15)
        cp1.font.bold = True
        cp1.font.color.rgb = PRIMARY_BLUE

        cp2 = ctf.add_paragraph()
        cp2.text = f"📍 {cloc}  •  {cbadge}"
        cp2.font.name = "Segoe UI"
        cp2.font.size = Pt(9.5)
        cp2.font.bold = True
        cp2.font.color.rgb = ACCENT_GOLD
        cp2.space_before = Pt(3)

        cp3 = ctf.add_paragraph()
        cp3.text = f"Commercial Strengths:"
        cp3.font.name = "Segoe UI"
        cp3.font.size = Pt(11)
        cp3.font.bold = True
        cp3.font.color.rgb = TEXT_DARK
        cp3.space_before = Pt(6)

        for pt in points:
            pp = ctf.add_paragraph()
            pp.text = f"✔ {pt}"
            pp.font.name = "Segoe UI"
            pp.font.size = Pt(9.5)
            pp.font.color.rgb = TEXT_MUTED
            pp.space_before = Pt(3)

    # ==========================================
    # SLIDE 10: DELIVERED PORTFOLIO (Part 1 - Thirumala Towers Series)
    # ==========================================
    slide10 = prs.slides.add_slide(blank_layout)
    bg10 = slide10.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    set_shape_flat(bg10, BG_LIGHT)
    add_header(slide10, "Delivered Milestones — Thirumala Towers Series", "Completed Projects", 10)

    towers = [
        ("Thirumala Towers (Boduppal)", "Boduppal, Hyderabad", "images/projects/sv-heights.jpg",
         "Delivered Landmark", "Premium multi-story residential community with landscaped surroundings and 100% occupancy."),
        ("Thirumala Towers (Medipally)", "Medipally, Hyderabad", "images/projects/sv-heights-aerial.jpg",
         "Delivered Landmark", "Strategically located near Warangal Highway, featuring robust seismic construction & spacious floor plans."),
        ("Thirumala Towers (Ramanthapur)", "Indira Nagar, Ramanthapur", "images/projects/thirumala-modern.jpg",
         "Delivered Landmark", "Centrally located near Amberpet-Uppal stretch, renowned for superior water abundance & pristine maintenance."),
        ("Keshav's Thirumala Residency", "Chilakanagar, Boduppal", "images/projects/keshav-residency.jpg",
         "Delivered Landmark", "Exquisite boutique apartment enclave with premier wood finishes, high privacy, and community lifestyle.")
    ]

    for idx, (tname, tloc, timg, tbadge, tdesc) in enumerate(towers):
        r = idx // 2
        c = idx % 2
        tcx = Inches(0.8 + c * 5.9)
        tcy = Inches(1.4 + r * 2.7)

        tcard = slide10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, tcx, tcy, Inches(5.7), Inches(2.5))
        set_shape_flat(tcard, CARD_BG, BORDER_COLOR, 1)

        # Image thumbnail fitted proportionally (NO STRETCH, NO CROP)
        if os.path.exists(timg):
            add_fitted_picture(slide10, timg, tcx + Inches(0.15), tcy + Inches(0.15), Inches(2.2), Inches(2.2), bg_color=DARK_NAVY)

        ttb = slide10.shapes.add_textbox(tcx + Inches(2.45), tcy + Inches(0.15), Inches(3.1), Inches(2.2))
        ttf = ttb.text_frame
        ttf.word_wrap = True
        ttf.margin_top = ttf.margin_left = 0

        tp1 = ttf.paragraphs[0]
        tp1.text = tname
        tp1.font.name = "Segoe UI"
        tp1.font.size = Pt(12)
        tp1.font.bold = True
        tp1.font.color.rgb = PRIMARY_BLUE

        tp2 = ttf.add_paragraph()
        tp2.text = f"📍 {tloc}"
        tp2.font.name = "Segoe UI"
        tp2.font.size = Pt(9.5)
        tp2.font.bold = True
        tp2.font.color.rgb = ACCENT_GOLD
        tp2.space_before = Pt(2)

        tp3 = ttf.add_paragraph()
        tp3.text = f"Status: {tbadge} (100% Handed Over)"
        tp3.font.name = "Segoe UI"
        tp3.font.size = Pt(9)
        tp3.font.bold = True
        tp3.font.color.rgb = GREEN_SUCCESS
        tp3.space_before = Pt(3)

        tp4 = ttf.add_paragraph()
        tp4.text = tdesc
        tp4.font.name = "Segoe UI"
        tp4.font.size = Pt(9)
        tp4.font.color.rgb = TEXT_MUTED
        tp4.space_before = Pt(3)

    # ==========================================
    # SLIDE 11: DELIVERED PORTFOLIO (Part 2 - Independent Houses & Enclaves)
    # ==========================================
    slide11 = prs.slides.add_slide(blank_layout)
    bg11 = slide11.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    set_shape_flat(bg11, BG_LIGHT)
    add_header(slide11, "Delivered Communities — Independent Houses & Enclaves", "Completed Projects", 11)

    houses = [
        ("60 Independent Houses", "Balaji Hills & Rajeshekar Colony", "images/projects/independent-houses.jpg",
         "Delivered Landmark", "A prestigious township of 60 custom-built independent villas and duplexes with wide roads & green landscapes."),
        ("Hasini Enclave", "Chilakanagar, Boduppal", "images/projects/keshav-residency.jpg",
         "Delivered Landmark", "Peaceful residential community featuring Vaastu-compliant homes, uninterrupted water supply, and top security."),
        ("Kesava Residency", "Boduppal, Hyderabad", "images/projects/thirumala-modern.jpg",
         "Delivered Landmark", "Elegantly finished residential apartments with quality fittings, secure compound, and high neighborhood value."),
        ("Sagar Simha Nilayam", "Yapral, Secunderabad Belt", "images/projects/thirumala-modern.jpg",
         "Delivered Landmark", "Lush green cantonment belt development offering clean air, serene community atmosphere, and modern comforts.")
    ]

    for idx, (tname, tloc, timg, tbadge, tdesc) in enumerate(houses):
        r = idx // 2
        c = idx % 2
        tcx = Inches(0.8 + c * 5.9)
        tcy = Inches(1.4 + r * 2.7)

        tcard = slide11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, tcx, tcy, Inches(5.7), Inches(2.5))
        set_shape_flat(tcard, CARD_BG, BORDER_COLOR, 1)

        if os.path.exists(timg):
            add_fitted_picture(slide11, timg, tcx + Inches(0.15), tcy + Inches(0.15), Inches(2.2), Inches(2.2), bg_color=DARK_NAVY)

        ttb = slide11.shapes.add_textbox(tcx + Inches(2.45), tcy + Inches(0.15), Inches(3.1), Inches(2.2))
        ttf = ttb.text_frame
        ttf.word_wrap = True
        ttf.margin_top = ttf.margin_left = 0

        tp1 = ttf.paragraphs[0]
        tp1.text = tname
        tp1.font.name = "Segoe UI"
        tp1.font.size = Pt(12)
        tp1.font.bold = True
        tp1.font.color.rgb = PRIMARY_BLUE

        tp2 = ttf.add_paragraph()
        tp2.text = f"📍 {tloc}"
        tp2.font.name = "Segoe UI"
        tp2.font.size = Pt(9.5)
        tp2.font.bold = True
        tp2.font.color.rgb = ACCENT_GOLD
        tp2.space_before = Pt(2)

        tp3 = ttf.add_paragraph()
        tp3.text = f"Status: {tbadge} (100% Handed Over)"
        tp3.font.name = "Segoe UI"
        tp3.font.size = Pt(9)
        tp3.font.bold = True
        tp3.font.color.rgb = GREEN_SUCCESS
        tp3.space_before = Pt(3)

        tp4 = ttf.add_paragraph()
        tp4.text = tdesc
        tp4.font.name = "Segoe UI"
        tp4.font.size = Pt(9)
        tp4.font.color.rgb = TEXT_MUTED
        tp4.space_before = Pt(3)

    # ==========================================
    # SLIDE 12: DELIVERED PORTFOLIO (Part 3 - Uppal & Boduppal Signatures)
    # ==========================================
    slide12 = prs.slides.add_slide(blank_layout)
    bg12 = slide12.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    set_shape_flat(bg12, BG_LIGHT)
    add_header(slide12, "Delivered Communities — Uppal & Boduppal Signatures", "Completed Projects", 12)

    mores = [
        ("Thirumala Heights", "Swaroop Nagar, Uppal, Hyderabad", "images/projects/sv-heights.jpg",
         "Delivered Landmark", "Sophisticated urban apartments in close touch with Uppal circle, stadium, and metro junction."),
        ("Kesava Residency (NTR Circle)", "Near NTR Statue, Boduppal", "images/projects/keshav-residency.jpg",
         "Delivered Landmark", "Central commercial-residential address with walking access to markets, clinics, banks, and schools."),
        ("Thirumala Apartments", "Balaji Hills, Boduppal", "images/projects/keshav-aerial.jpg",
         "Delivered Landmark", "Pioneering residential complex that set early construction quality standards across Balaji Hills."),
        ("Comprehensive East Corridor Footprint", "East Hyderabad Growth Corridors", "images/projects/sv-heights-aerial.jpg",
         "Delivered Landmark", "Consistently delivering homes that appreciate year after year with pristine legal titles and happy owners.")
    ]

    for idx, (tname, tloc, timg, tbadge, tdesc) in enumerate(mores):
        r = idx // 2
        c = idx % 2
        tcx = Inches(0.8 + c * 5.9)
        tcy = Inches(1.4 + r * 2.7)

        tcard = slide12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, tcx, tcy, Inches(5.7), Inches(2.5))
        set_shape_flat(tcard, CARD_BG, BORDER_COLOR, 1)

        if os.path.exists(timg):
            add_fitted_picture(slide12, timg, tcx + Inches(0.15), tcy + Inches(0.15), Inches(2.2), Inches(2.2), bg_color=DARK_NAVY)

        ttb = slide12.shapes.add_textbox(tcx + Inches(2.45), tcy + Inches(0.15), Inches(3.1), Inches(2.2))
        ttf = ttb.text_frame
        ttf.word_wrap = True
        ttf.margin_top = ttf.margin_left = 0

        tp1 = ttf.paragraphs[0]
        tp1.text = tname
        tp1.font.name = "Segoe UI"
        tp1.font.size = Pt(12)
        tp1.font.bold = True
        tp1.font.color.rgb = PRIMARY_BLUE

        tp2 = ttf.add_paragraph()
        tp2.text = f"📍 {tloc}"
        tp2.font.name = "Segoe UI"
        tp2.font.size = Pt(9.5)
        tp2.font.bold = True
        tp2.font.color.rgb = ACCENT_GOLD
        tp2.space_before = Pt(2)

        tp3 = ttf.add_paragraph()
        tp3.text = f"Status: {tbadge} (100% Handed Over)"
        tp3.font.name = "Segoe UI"
        tp3.font.size = Pt(9)
        tp3.font.bold = True
        tp3.font.color.rgb = GREEN_SUCCESS
        tp3.space_before = Pt(3)

        tp4 = ttf.add_paragraph()
        tp4.text = tdesc
        tp4.font.name = "Segoe UI"
        tp4.font.size = Pt(9)
        tp4.font.color.rgb = TEXT_MUTED
        tp4.space_before = Pt(3)

    # ==========================================
    # SLIDE 13: WHY CHOOSE TIRUMALA NIRMAAN
    # ==========================================
    slide13 = prs.slides.add_slide(blank_layout)
    bg13 = slide13.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    set_shape_flat(bg13, BG_LIGHT)
    add_header(slide13, "Why Invest & Build With Tirumala Nirmaan", "Our Value Proposition", 13)

    pillars_why = [
        ("Uncompromising Build Quality", "Rigorous multi-stage engineering checks, Fe-550D TMT steel, and branded fixtures that last generations.", PRIMARY_BLUE),
        ("100% Clear & Verified Titles", "Zero legal ambiguity. Every property is backed by clean documentation, GHMC/HMDA permits, and RERA registration.", ACCENT_GOLD),
        ("Punctual On-Time Handover", "Disciplined project management guaranteeing that buyers receive keys to their dream homes on schedule.", PRIMARY_BLUE),
        ("Strategic High-Growth Locations", "Positioned in rapid appreciation zones with immediate proximity to Metro, ORR, IT hubs, and top institutions.", ACCENT_GOLD),
        ("Pre-Approved Bank Finances", "Hassle-free loan sanctions from SBI, HDFC, ICICI, LIC Housing, and Axis Bank with lowest competitive interest rates.", GREEN_SUCCESS),
        ("Dedicated After-Sales Care", "Complete post-handover society formation assistance, warranty support, and long-term customer relationship care.", PRIMARY_BLUE)
    ]

    for idx, (wtitle, wdesc, wcol) in enumerate(pillars_why):
        r = idx // 3
        c = idx % 3
        wx = Inches(0.8 + c * 3.95)
        wy = Inches(1.4 + r * 2.7)

        wcard = slide13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, wx, wy, Inches(3.8), Inches(2.45))
        set_shape_flat(wcard, CARD_BG, BORDER_COLOR, 1)

        wbar = slide13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, wx, wy, Inches(3.8), Inches(0.12))
        set_shape_flat(wbar, wcol)

        wtf = wcard.text_frame
        wtf.word_wrap = True
        wtf.margin_top = Inches(0.3)
        wtf.margin_left = wtf.margin_right = Inches(0.25)

        wp1 = wtf.paragraphs[0]
        wp1.text = f"✔ {wtitle}"
        wp1.font.name = "Segoe UI"
        wp1.font.size = Pt(13)
        wp1.font.bold = True
        wp1.font.color.rgb = wcol

        wp2 = wtf.add_paragraph()
        wp2.text = wdesc
        wp2.font.name = "Segoe UI"
        wp2.font.size = Pt(10)
        wp2.font.color.rgb = TEXT_MUTED
        wp2.space_before = Pt(6)

    # ==========================================
    # SLIDE 14: LOCATION & GROWTH CORRIDOR MAP
    # ==========================================
    slide14 = prs.slides.add_slide(blank_layout)
    bg14 = slide14.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    set_shape_flat(bg14, BG_LIGHT)
    add_header(slide14, "Strategic Geographical Footprint in Hyderabad", "Location Advantage", 14)

    lcard = slide14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(6.0), Inches(5.4))
    set_shape_flat(lcard, CARD_BG, BORDER_COLOR, 1)
    ltf = lcard.text_frame
    ltf.word_wrap = True
    ltf.margin_top = ltf.margin_left = Inches(0.35)
    ltf.margin_right = Inches(0.35)

    lp = ltf.paragraphs[0]
    lp.text = "The East Hyderabad Infrastructure Revolution"
    lp.font.name = "Segoe UI"
    lp.font.size = Pt(16)
    lp.font.bold = True
    lp.font.color.rgb = PRIMARY_BLUE

    zones = [
        ("Nagole & Uppal Junctions", "Direct access to Hyderabad Metro Blue Line, Uppal Elevated Corridor, Rajiv Gandhi International Cricket Stadium."),
        ("Boduppal & Peerzadiguda Belt", "Self-sustained thriving residential epicentre with top educational hubs, hospitals, and bustling markets."),
        ("Pocharam & Ghatkesar IT Corridor", "Home to 50,000+ tech professionals (Infosys, Raheja Mindspace) driving explosive rental and villa demand."),
        ("Ramanthapur & Amberpet Arterials", "Central commercial gateway connecting Secunderabad, Koti, and Dilsukhnagar in minutes.")
    ]

    for ztitle, zdesc in zones:
        zp = ltf.add_paragraph()
        zp.text = f"📍 {ztitle}"
        zp.font.name = "Segoe UI"
        zp.font.size = Pt(11)
        zp.font.bold = True
        zp.font.color.rgb = TEXT_DARK
        zp.space_before = Pt(8)

        zd = ltf.add_paragraph()
        zd.text = zdesc
        zd.font.name = "Segoe UI"
        zd.font.size = Pt(9.5)
        zd.font.color.rgb = TEXT_MUTED

    rcard = slide14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.1), Inches(1.4), Inches(5.4), Inches(5.4))
    set_shape_flat(rcard, CARD_BG, BORDER_COLOR, 1)
    
    rbar = slide14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.1), Inches(1.4), Inches(5.4), Inches(0.12))
    set_shape_flat(rbar, ACCENT_GOLD)

    rtf = rcard.text_frame
    rtf.word_wrap = True
    rtf.margin_top = rtf.margin_left = Inches(0.35)
    rtf.margin_right = Inches(0.35)

    rp = rtf.paragraphs[0]
    rp.text = "Connectivity & Travel Transit Times"
    rp.font.name = "Segoe UI"
    rp.font.size = Pt(16)
    rp.font.bold = True
    rp.font.color.rgb = ACCENT_GOLD

    times = [
        ("🚇 Nagole Metro Station", "2 to 5 Minutes"),
        ("🛣️ Outer Ring Road (ORR Exit 8 & 9)", "10 to 12 Minutes"),
        ("💻 Raheja Mindspace / Infosys SEZ", "12 to 15 Minutes"),
        ("🚆 Secunderabad Railway Station", "20 to 25 Minutes"),
        ("✈️ Rajiv Gandhi Intl Airport (via ORR)", "40 to 45 Minutes"),
        ("🏥 Multi-Specialty Healthcare (KIMS, Aditya)", "5 to 10 Minutes")
    ]

    for place, duration in times:
        tp = rtf.add_paragraph()
        tp.text = f"{place}  ➔  {duration}"
        tp.font.name = "Segoe UI"
        tp.font.size = Pt(11)
        tp.font.bold = True
        tp.font.color.rgb = TEXT_DARK
        tp.space_before = Pt(8)

    # ==========================================
    # SLIDE 15: CLOSING & VIP SITE VISIT (Dark Theme)
    # ==========================================
    slide15 = prs.slides.add_slide(blank_layout)
    bg15 = slide15.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    set_shape_flat(bg15, DARK_NAVY)

    b15 = slide15.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(7.32), Inches(13.333), Inches(0.18))
    set_shape_flat(b15, ACCENT_GOLD)

    # Centered Logo in a clean 1:1 SQUARE frame (NO STRETCH)
    if os.path.exists(LOGO_PATH):
        lcard15 = slide15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.666), Inches(0.7), Inches(2.0), Inches(2.0))
        set_shape_flat(lcard15, CARD_BG, None)
        add_fitted_picture(slide15, LOGO_PATH, Inches(5.766), Inches(0.8), Inches(1.8), Inches(1.8))

    cbox = slide15.shapes.add_textbox(Inches(1.5), Inches(2.85), Inches(10.333), Inches(1.2))
    ctf = cbox.text_frame
    ctf.word_wrap = True
    ctf.margin_top = ctf.margin_left = 0
    
    cp1 = ctf.paragraphs[0]
    cp1.text = "Begin Your Journey to Lasting Living"
    cp1.alignment = PP_ALIGN.CENTER
    cp1.font.name = "Segoe UI"
    cp1.font.size = Pt(30)
    cp1.font.bold = True
    cp1.font.color.rgb = TEXT_WHITE

    cp2 = ctf.add_paragraph()
    cp2.text = "Schedule a personalized VIP site inspection across any of our ongoing or upcoming projects today."
    cp2.alignment = PP_ALIGN.CENTER
    cp2.font.name = "Segoe UI"
    cp2.font.size = Pt(13)
    cp2.font.color.rgb = RGBColor(203, 213, 225)
    cp2.space_before = Pt(4)

    contacts = [
        ("📞 Direct Contact Hotline", "+91 92465 24346\n+91 98480 12345", "Available Mon-Sun (9AM - 8PM)"),
        ("🌐 Official Web Portal", "tirumala-tau.vercel.app\ncontact@tirumalanirmaan.com", "24/7 Digital Inquiry Form"),
        ("🏢 Corporate Office", "Boduppal, Near Uppal Ring Road,\nHyderabad, Telangana - 500092", "Site Visit Cab Available")
    ]

    for idx, (ctitle, cval, cextra) in enumerate(contacts):
        card_x = Inches(1.5 + idx * 3.55)
        card_shape = slide15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, card_x, Inches(4.3), Inches(3.2), Inches(2.2))
        set_shape_flat(card_shape, SECONDARY_NAVY, PRIMARY_BLUE, 1)

        cbar = slide15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, card_x, Inches(4.3), Inches(3.2), Inches(0.1))
        set_shape_flat(cbar, ACCENT_GOLD)

        stf = card_shape.text_frame
        stf.word_wrap = True
        stf.margin_top = Inches(0.3)
        stf.margin_left = stf.margin_right = Inches(0.2)

        p1 = stf.paragraphs[0]
        p1.text = ctitle
        p1.alignment = PP_ALIGN.CENTER
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = ACCENT_GOLD

        p2 = stf.add_paragraph()
        p2.text = cval
        p2.alignment = PP_ALIGN.CENTER
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(11.5)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE
        p2.space_before = Pt(6)

        p3 = stf.add_paragraph()
        p3.text = cextra
        p3.alignment = PP_ALIGN.CENTER
        p3.font.name = "Segoe UI"
        p3.font.size = Pt(8.5)
        p3.font.color.rgb = RGBColor(148, 163, 184)
        p3.space_before = Pt(6)

    # Save output
    output_path = os.path.abspath("Tirumala_Nirmaan_Projects_Presentation.pptx")
    prs.save(output_path)
    print(f"Presentation generated successfully: {output_path}")

if __name__ == "__main__":
    create_presentation()

import {
    useEffect,
    useRef,
    useState
} from "react";
import {
    ArrowDown,
    ArrowUpRight,
    CalendarDays,
    Check,
    ChevronRight,
    Instagram,
    MapPin,
    Menu,
    Minus,
    Plus,
    Sparkles,
    Ticket,
    X
} from "lucide-react";
import "@/App.css";

const images = {
    hero: "https://static.prod-images.emergentagent.com/jobs/0abad239-0cc1-4618-a23d-13ab0acc8554/images/0e5cdcd802d18387c83e9f4a3739d1efc2602008c037304153cec9622dc986dd.jpeg",
    dancers: "https://static.prod-images.emergentagent.com/jobs/0abad239-0cc1-4618-a23d-13ab0acc8554/images/5552582f490bf5d9e91fc69381fc90caf9dafaff01788de20496ac38ed505c2f.jpeg",
    dj: "https://static.prod-images.emergentagent.com/jobs/0abad239-0cc1-4618-a23d-13ab0acc8554/images/b3b3af88a61f84757be10bc64694eec21cf150df1270843bfd9a74c292d6b65a.jpeg",
    food: "https://static.prod-images.emergentagent.com/jobs/0abad239-0cc1-4618-a23d-13ab0acc8554/images/b896f8c318dcedff035b580268911af14b2a65bd8f30007cb6129d43617e736f.jpeg",
};

const tickets = [{
        name: "Raas Regular",
        price: 999,
        note: "The classic night out",
        perks: ["Entry to the full festival", "Garba arena access", "Food & craft village"]
    },
    {
        name: "Raas Royale",
        price: 1999,
        note: "For the ones who want more",
        perks: ["Priority entry lane", "Elevated viewing deck", "Welcome drink & gift"]
    },
    {
        name: "The Circle",
        price: 3499,
        note: "Bring your whole crew",
        perks: ["Group entry for 4", "Reserved lounge seating", "Premium dinner spread"]
    },
];

const eventDate = new Date("2026-10-11T18:00:00+05:30");
const getCountdown = () => {
    const remaining = Math.max(0, eventDate.getTime() - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    return {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        isLive: remaining === 0,
    };
};

function App() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [bookingOpen, setBookingOpen] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [scrolled, setScrolled] = useState(false);
    const [countdown, setCountdown] = useState(getCountdown);
    const modalCloseRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (bookingOpen) modalCloseRef.current ? .focus();
    }, [bookingOpen]);

    useEffect(() => {
        const countdownTimer = window.setInterval(() => setCountdown(getCountdown()), 1000);
        return () => window.clearInterval(countdownTimer);
    }, []);

    const openBooking = () => {
        setConfirmed(false);
        setBookingOpen(true);
    };
    const total = tickets[selectedTicket].price * quantity;

    return ( <
            div className = "site-shell" >
            <
            header className = {
                `nav ${scrolled ? "nav-scrolled" : ""}`
            }
            data - testid = "site-navigation" >
            <
            a className = "brand"
            href = "#top"
            data - testid = "brand-home" > < span > WCCBM < /span><small>GARBA NIGHT</small > < /a> <
            nav id = "mobile-navigation"
            className = {
                menuOpen ? "nav-links nav-links-open" : "nav-links"
            }
            data - testid = "desktop-navigation" > {
                [
                    ['about', 'The Night'],
                    ['experience', 'Experience'],
                    ['schedule', 'Schedule'],
                    ['gallery', 'Gallery'],
                    ['tickets', 'Tickets']
                ].map(([href, label]) => < a key = {
                        href
                    }
                    href = {
                        `#${href}`
                    }
                    data - testid = {
                        `nav-${href}-link`
                    }
                    onClick = {
                        () => setMenuOpen(false)
                    } > {
                        label
                    } < /a>)} <
                    /nav> <
                    button className = "nav-ticket"
                    onClick = {
                        openBooking
                    }
                    data - testid = "nav-get-tickets-button" > Get tickets < ArrowUpRight size = {
                        16
                    }
                    /></button >
                    <
                    button className = "menu-button"
                    onClick = {
                        () => setMenuOpen(!menuOpen)
                    }
                    aria - label = "Toggle navigation"
                    aria - expanded = {
                        menuOpen
                    }
                    aria - controls = "mobile-navigation"
                    data - testid = "mobile-menu-button" > {
                        menuOpen ? < X / > : < Menu / >
                    } < /button> <
                    /header>

                    <
                    main id = "top" >
                    <
                    section className = "hero"
                    data - testid = "hero-section" >
                    <
                    img className = "hero-image"
                    src = {
                        images.hero
                    }
                    alt = "Dandiya dancers celebrating beneath festival lights"
                    data - testid = "hero-image" / >
                    <
                    div className = "hero-overlay" / >
                    <
                    div className = "hero-glow glow-one" / > < div className = "hero-glow glow-two" / >
                    <
                    div className = "hero-content page-width" >
                    <
                    div className = "eyebrow hero-eyebrow" > < span className = "eyebrow-line" / > THE CITY & apos; S BIGGEST RAAS RETURNS < /div> <
                    h1 data - testid = "hero-title" > Feel the < br / > < em > rhythm. < /em><br / > Own the night. < /h1> <
                    p className = "hero-copy"
                    data - testid = "hero-description" > A wild, wonderful night of music, movement, and togetherness.Come as you are.Leave glowing. < /p> <
                    div className = "hero-actions" > < button className = "button button-gold"
                    onClick = {
                        openBooking
                    }
                    data - testid = "hero-get-tickets-button" > Get tickets < ArrowUpRight size = {
                        17
                    }
                    /></button > < a className = "text-link"
                    href = "#experience"
                    data - testid = "hero-explore-link" > Explore the night < ArrowDown size = {
                        16
                    }
                    /></a > < /div> <
                    div className = "hero-meta"
                    data - testid = "hero-event-details" > < div > < CalendarDays size = {
                        18
                    }
                    /><span><b>11 OCT 2026</b > < small > SUNDAY· DOORS 6 PM < /small></span > < /div><div><MapPin size={18} / > < span > < b > THE GRAND PAVILION < /b><small>AHMEDABAD, GUJARAT</small > < /span></div > < /div> <
                    div className = "countdown-card"
                    data - testid = "countdown-card"
                    aria - live = "polite" > < div className = "countdown-label" > < span className = "pulse-dot" / > {
                        countdown.isLive ? "THE NIGHT IS LIVE" : "COUNTING DOWN TO OPENING NIGHT"
                    } < /div><div className="countdown-values">{[[countdown.days, "DAYS", "countdown-days"], [countdown.hours, "HRS", "countdown-hours"], [countdown.minutes, "MIN", "countdown-minutes"], [countdown.seconds, "SEC", "countdown-seconds"]].map(([value, label, testId]) => <div key={label} data-testid={testId}><strong>{String(value).padStart(2, "0")}</strong > < small > {
                        label
                    } < /small></div > )
            } < /div></div >
            <
            /div> <
            div className = "hero-scroll" > < span > SCROLL TO EXPLORE < /span><div / > < /div> <
            div className = "hero-stamp" > < span > RAAS < /span><strong>∞</strong > < small > CELEBRATE < br / > TOGETHER < /small></div >
            <
            /section>

            <
            section className = "intro section page-width"
            id = "about"
            data - testid = "about-section" >
            <
            div className = "section-kicker" > < span > 01 < /span><i / > < span > THE NIGHT < /span></div >
            <
            div className = "intro-grid" > < h2 > Some nights < br / > < em > stay with you. < /em></h
            2 > < div className = "intro-copy" > < p > WCCBM Garba Night is more than a festival.It is the feeling of thousands of people moving as one— sticks clicking, skirts spinning, and a beat that refuses to
            let you stand still. < /p><a className="arrow-link" href="#schedule" data-testid="discover-schedule-link">Discover the schedule <ChevronRight size={16} / > < /a></div > < /div> <
                div className = "stat-row" > < div > < strong > 8 < span > + < /span></strong > < small > HOURS OF < br / > NON - STOP RAAS < /small></div > < div > < strong > 03 < /strong><small>LIVE ACTS<br / > ONE ELECTRIC NIGHT < /small></div > < div > < strong > ∞ < /strong><small>MEMORIES<br / > IN THE MAKING < /small></div > < /div> <
                /section>

                <
                section className = "experience section"
            id = "experience"
            data - testid = "experience-section" >
            <
            div className = "page-width" > < div className = "section-kicker light" > < span > 02 < /span><i / > < span > THE EXPERIENCE < /span></div > < div className = "section-heading-row" > < h2 > Come
            for the < em > music. < /em><br / > Stay
            for the magic. < /h2><p>Every detail is designed to make your night feel a little more unforgettable.</p > < /div> <
            div className = "experience-grid" > < article className = "experience-card card-tall" > < img src = {
                images.dancers
            }
            alt = "Dancers in colorful traditional dress" / > < div className = "card-shade" / > < div className = "card-label" > < span > 01 < /span><h3>Raas<br / > all night < /h3><p>Find your circle. Find your rhythm.</p > < /div></article > < article className = "experience-card" > < img src = {
                images.dj
            }
            alt = "DJ performing at a colorful festival" / > < div className = "card-shade" / > < div className = "card-label" > < span > 02 < /span><h3>Turn it<br / > up < /h3><p>Live DJs. Big sounds. Zero quiet moments.</p > < /div></article > < article className = "experience-card" > < img src = {
                images.food
            }
            alt = "Festive food at a Gujarati night market" / > < div className = "card-shade" / > < div className = "card-label" > < span > 03 < /span><h3>Taste the<br / > festive < /h3><p>Local flavors, sweet treats, shared plates.</p > < /div></article > < /div> <
            /div> <
            /section>

            <
            section className = "schedule section page-width"
            id = "schedule"
            data - testid = "schedule-section" > < div className = "section-kicker" > < span > 03 < /span><i / > < span > THE RHYTHM < /span></div > < div className = "section-heading-row" > < h2 > One night. < br / > < em > Many moods. < /em></h
            2 > < p > From the first dandiya beat to the final encore, the night keeps moving. < /p></div > < div className = "timeline" > {
                [
                    ['06:00 PM', 'Gates open', 'Start with a wander through the craft village.'],
                    ['07:00 PM', 'The first beat', 'Warm up with our resident Garba collective.'],
                    ['08:30 PM', 'Raas in full colour', 'Live performances, big circles, bigger energy.'],
                    ['10:30 PM', 'The midnight set', 'Lights down. Music up. See you on the dance floor.']
                ].map(([time, title, desc], i) => < div className = "timeline-item"
                    key = {
                        time
                    }
                    data - testid = {
                        `schedule-item-${i}`
                    } > < time > {
                        time
                    } < /time><span className="timeline-dot" / > < div > < h3 > {
                        title
                    } < /h3><p>{desc}</p > < /div><ChevronRight size={18} / > < /div>)}</div > < /section>

                    <
                    section className = "gallery section"
                    id = "gallery"
                    data - testid = "gallery-section" > < div className = "page-width" > < div className = "section-kicker light" > < span > 04 < /span><i / > < span > IN THE MOMENT < /span></div > < div className = "gallery-head" > < h2 > Bring your < br / > < em > people. < /em></h
                    2 > < p > Dress bright.Dance loud.Make the kind of memories you can feel in your bones. < /p></div > < div className = "gallery-grid" > < div className = "gallery-image image-a" > < img src = {
                        images.dancers
                    }
                    alt = "Garba dancers celebrating" / > < /div><div className="gallery-image image-b"><img src={images.dj} alt="Festival crowd and DJ lights" / > < /div><div className="gallery-quote"><Sparkles size={22} / > < p > “The best nights are the ones where the music takes over.” < /p><small>#WCCBMGARBANIGHT</small > < /div><div className="gallery-image image-c"><img src={images.food} alt="Traditional festive food" / > < /div></div > < /div></section >

                    <
                    section className = "tickets section page-width"
                    id = "tickets"
                    data - testid = "tickets-section" > < div className = "section-kicker" > < span > 05 < /span><i / > < span > YOUR PASS TO THE NIGHT < /span></div > < div className = "section-heading-row" > < h2 > Pick your < br / > < em > kind of magic. < /em></h
                    2 > < p > Good times are better together.Choose your pass and get ready to lose yourself in the rhythm. < /p></div > < div className = "ticket-grid" > {
                        tickets.map((ticket, i) => < article className = {
                                `ticket-card ${i === 1 ? 'ticket-featured' : ''}`
                            }
                            key = {
                                ticket.name
                            }
                            data - testid = {
                                `ticket-card-${i}`
                            } > < div className = "ticket-top" > < span > {
                                i === 1 ? 'MOST LOVED' : `PASS 0${i + 1}`
                            } < /span><Ticket size={20} / > < /div><h3>{ticket.name}</h
                            3 > < p > {
                                ticket.note
                            } < /p><div className="ticket-price"><small>₹</small > {
                                ticket.price
                            } < small > / PERSON</small > < /div><ul>{ticket.perks.map(perk => <li key={perk}><Check size={14} / > {
                                perk
                            } < /li>)}</ul > < button className = {
                                i === 1 ? 'button button-gold full' : 'button button-outline full'
                            }
                            onClick = {
                                () => {
                                    setSelectedTicket(i);
                                    openBooking();
                                }
                            }
                            data - testid = {
                                `ticket-select-${i}-button`
                            } > Choose this pass < ArrowUpRight size = {
                                16
                            }
                            /></button > < /article>)}</div > < /section>

                            <
                            section className = "location section page-width"
                            data - testid = "location-section" > < div className = "location-card" > < div > < div className = "section-kicker" > < span > 06 < /span><i / > < span > FIND US < /span></div > < h2 > The night < br / > < em > starts here. < /em></h
                            2 > < div className = "address" > < MapPin size = {
                                19
                            }
                            /><p><b>The Grand Pavilion</b > < br / > Sardar Patel Ring Road < br / > Ahmedabad, Gujarat 380054 < /p></div > < a className = "arrow-link"
                            href = "https://maps.google.com"
                            target = "_blank"
                            rel = "noreferrer"
                            data - testid = "get-directions-link" > Get directions < ArrowUpRight size = {
                                16
                            }
                            /></a > < /div><div className="map-art" data-testid="location-map-art"><div className="map-grid" / > < div className = "map-pin" > < MapPin size = {
                                25
                            }
                            /></div > < span > AHMEDABAD < br / > < small > THE GRAND PAVILION < /small></span > < /div></div > < /section> <
                            /main>

                            <
                            footer className = "footer"
                            data - testid = "site-footer" > < div className = "page-width footer-inner" > < div className = "footer-brand" > < a className = "brand"
                            href = "#top"
                            data - testid = "footer-brand-link" > < span > WCCBM < /span><small>GARBA NIGHT</small > < /a><p>One night. One rhythm.<br / > All of us. < /p></div > < div className = "footer-links" > < div > < small > EXPLORE < /small><a href="#about" data-testid="footer-about-link">The night</a > < a href = "#experience"
                            data - testid = "footer-experience-link" > Experience < /a><a href="#tickets" data-testid="footer-tickets-link">Tickets</a > < /div><div><small>FOLLOW ALONG</small > < a href = "https://instagram.com"
                            target = "_blank"
                            rel = "noreferrer"
                            data - testid = "instagram-link" > < Instagram size = {
                                15
                            }
                            /> Instagram</a > < a href = "mailto:hello@wccbmgarba.com"
                            data - testid = "email-link" > hello @wccbmgarba.com < /a></div > < /div><div className="footer-mark">✦<br / > < small > SEE YOU < br / > ON THE < br / > DANCE FLOOR < /small></div > < /div><div className="page-width footer-bottom"><span>© 2026 WCCBM GARBA NIGHT</span > < span > MADE WITH < b > ♥ < /b> IN AHMEDABAD</span > < /div></footer >

                            {
                                bookingOpen && < div className = "modal-backdrop"
                                role = "presentation"
                                onClick = {
                                    () => setBookingOpen(false)
                                }
                                data - testid = "ticket-modal-backdrop" > < div className = "booking-modal"
                                role = "dialog"
                                aria - modal = "true"
                                aria - labelledby = "booking-title"
                                onClick = {
                                    e => e.stopPropagation()
                                }
                                data - testid = "ticket-booking-modal" > < button ref = {
                                    modalCloseRef
                                }
                                className = "modal-close"
                                onClick = {
                                    () => setBookingOpen(false)
                                }
                                aria - label = "Close ticket booking"
                                data - testid = "ticket-modal-close" > < X size = {
                                    20
                                }
                                /></button > {
                                    confirmed ? < div className = "confirmation" > < div className = "check-circle" > < Check size = {
                                        30
                                    }
                                    /></div > < div className = "eyebrow" > YOU & apos;RE ON THE LIST < /div><h2>See you on<br / > < em > the dance floor. < /em></h
                                    2 > < p > Your WCCBM Garba Night pass is reserved.We’ ll send the details to your inbox shortly. < /p><button className="button button-gold" onClick={() => setBookingOpen(false)} data-testid="booking-done-button">Done <ArrowUpRight size={16} / > < /button></div > : < > < div className = "eyebrow" > YOUR TICKET < /div><h2 id="booking-title">Choose your<br / > < em > kind of night. < /em></h
                                    2 > < div className = "modal-choice-list" > {
                                        tickets.map((ticket, i) => < button key = {
                                                ticket.name
                                            }
                                            className = {
                                                `modal-choice ${selectedTicket === i ? 'active' : ''}`
                                            }
                                            onClick = {
                                                () => setSelectedTicket(i)
                                            }
                                            data - testid = {
                                                `modal-ticket-choice-${i}`
                                            } > < span > < b > {
                                                ticket.name
                                            } < /b><small>{ticket.note}</small > < /span><strong>₹{ticket.price}</strong > < span className = "choice-radio" > {
                                                selectedTicket === i && < Check size = {
                                                    12
                                                }
                                                />}</span > < /button>)}</div > < div className = "quantity-row" > < span > Number of passes < /span><div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" data-testid="decrease-quantity-button"><Minus size={15} / > < /button><strong data-testid="ticket-quantity">{quantity}</strong > < button onClick = {
                                                    () => setQuantity(quantity + 1)
                                                }
                                                aria - label = "Increase quantity"
                                                data - testid = "increase-quantity-button" > < Plus size = {
                                                    15
                                                }
                                                /></button > < /div></div > < div className = "modal-total" > < span > Total < /span><strong data-testid="booking-total">₹{total.toLocaleString('en-IN')}</strong > < /div><button className="button button-gold full" onClick={() => setConfirmed(true)} data-testid="confirm-booking-button">Confirm my pass <ArrowUpRight size={17} / > < /button><small className="secure-note">No payment is collected in this preview</small > < />}</div > < /div>} <
                                                /div>
                                            );
                                        }

                                        export default App;
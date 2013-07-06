/* Modified by Ebola ###
 *
 * 1. added an emoticons dialog
 *      - recent emoticons (me & users)
 *      - catalog based on emoji cheat sheet
 *      - press CTRL + mouse click to add emoticons continuously
 *          (without dialog closing)
 *      - smartly add spaces between emoticon text
 * 2. press arrow up/down in chat box to search chat history
 *      - 1. make sure chat box is empty then press arrow UP
 *      - 2. press UP/DOWN continuously to search between
 *          older and newer messages
 *      - 3. press other keys would stop searching immediately
 *      - max 20 items
 * 3. press ESC to focus chat box (when chat box is not focused),
 *      press ESC to clear chat box while typing (chat box is focused)
 * 4. added an AUTO-MEH button (just for fun, but srsly, don't press it!)
 * 5. added an OPEN VIDEO LINK button (without ?feature=player_embedded
 *      in url if u wanna paste the link in social media,
 *      soundcloud not supported)
 * 6. show user-box when clicking username in user-list
 * 7. fixed skipping video problem in original script (resume volume
 *      and video in next track)
 * 8. improved browser performance when switching song (dj advances)
 * 9. improved browser performance when plug.dj tab is not focused
 * 10. suppress "This session has now ended. Goodbye." alert box
 *      (still need to refresh the page when session dies)
 *
 * Version 1.02
 * Latest changelog:
 * 1. improved performace when tab is not focused
 * 2. automeh is set to false on default, pressing autowoot does not
 *      affect automeh so that you can disable autowoot
 *
 * This script is on Github:
 * https://github.com/ebola777/Plugbot-Enhanced-by-Ebola
 *
 * 6 JULY 2013,
 * Ebola
 */

/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * TERMS OF REPRODUCTION USE
 *
 * 1. Provide a link back to the original repository (this repository), as
 *      in, https://github.com/ConnerGDavis/Plugbot, that is well-visible
 *      wherever the source is being reproduced.  For example, should you
 *      display it on a website, you should provide a link above/below that
 *      which the users use, titled something such as "ORIGINAL AUTHOR".
 *
 * 2. Retain these three comments:  the GNU GPL license statement, this comment,
 *      and that below it, that details the author and purpose.
 *
 * Failure to follow these terms will result in me getting very angry at you
 * and having your software tweaked or removed if possible.  Either way, you're
 * still an idiot for not following such a basic rule, so at least I'll have
 * that going for me.
 */

//===== ### Emoji class =====
var EmojiUI = Class.extend({
    init: function() {
        // init constants
        this.TIMEOUT_FADEDiALOG = 1500;
        this.TAB_RECENTMe = 0;
        this.TAB_RECENTUsERS = 1;
        this.BLOCK_WIDTH = 17;
        this.BLOCK_HEIGHT = 17;
        this.SPRITE_WIDTH = 135;
        this.SPRITE_HEIGHT = 2022;
        this.SPRITE_SCALE = 1.2;
        this.KEYCODE_CONTI = 17;
        this.KEYCODE_ARROWUp = 38;
        this.KEYCODE_ARROWDoWN = 40;
        this.KEYCODE_ESC = 27;
        this.MAX_RECENT = {
            0: 40,
            1: 80
        };
        this.MAX_HISTORYChAT = 20;

        // init variables - preferences
        this.autoHide = false;

        // init variables - status
        this.visible = false;
        this.conti = false;
        this.historyMessage = [];
        this.historyConti = false;
        this.historyIndex = -1;
        this.recentItems = {
            0: {},
            1: {}
        };

        // init variables - objects
        this.timeout_fadeDialog = null;
        this.hasInitHandlers2 = false;

        // init variables - dialog
        this.dialog = null;
        this.scrollTop = {};
        this.preventScroll = false;
        this.currentTab = 3;
        this.tabs = [
            {
                name: 'Recent (Me)',
                index: 0
            },
            {
                name: 'Recent (Users)',
                index: 1
            },
            {
                name: 'All',
                index: 2
            },
            {
                name: 'Common',
                index: 3
            },
            {
                name: 'People',
                index: 4
            },
            {
                name: 'Nature',
                index: 5
            },
            {
                name: 'Objects',
                index: 6
            },
            {
                name: 'Places',
                index: 7
            },
            {
                name: 'Symbols',
                index: 8
            }
        ];
        this.rightItems = {};
        this.emo = {
            0: [ // recent (me)
            ],
            1: [ // recent (users)
            ],
            2: [ // all
                ':hash:', ':zero:', ':one:', ':two:', ':three:',
                ':four:', ':five:', ':six:', ':seven:', ':eight:',
                ':nine:', ':copyright:', ':registered:', ':mahjong:', ':black_joker:',
                ':a:', ':b:', ':o2:', ':parking:', ':ab:',
                ':cl:', ':cool:', ':free:', ':id:', ':new:',
                ':ng:', ':ok:', ':sos:', ':up:', ':vs:',
                ':cn:', ':de:', ':es:', ':fr:', ':uk:',
                ':it:', ':jp:', ':kr:', ':ru:', ':us:',
                ':koko:', ':sa:', ':u7121:', ':u6307:', ':u7981:',
                ':u7a7a:', ':u5408:', ':u6e80:', ':u6709:', ':u6708:',
                ':u7533:', ':u5272:', ':u55b6:', ':ideograph_advantage:', ':accept:',
                ':cyclone:', ':foggy:', ':closed_umbrella:', ':stars:',
                ':sunrise_over_mountains:', ':sunrise:', ':city_sunset:',
                ':city_sunrise:', ':rainbow:', ':bridge_at_night:', ':ocean:',
                ':volcano:', ':milky_way:', ':earth_africa:', ':earth_americas:',
                ':earth_asia:', ':globe_with_meridians:', ':new_moon:',
                ':waxing_crescent_moon:', ':first_quarter_moon:',
                ':waxing_gibbous_moon:', ':full_moon:', ':waning_gibbous_moon:',
                ':last_quarter_moon:', ':waning_crescent_moon:', ':crescent_moon:',
                ':new_moon_with_face:', ':first_quarter_moon_with_face:',
                ':last_quarter_moon_with_face:', ':full_moon_with_face:',
                ':sun_with_face:', ':star2:', ':chestnut:', ':seedling:',
                ':evergreen_tree:', ':deciduous_tree:', ':palm_tree:', ':cactus:',
                ':tulip:', ':cherry_blossom:', ':rose:', ':hibiscus:', ':sunflower:',
                ':blossom:', ':corn:', ':ear_of_rice:', ':herb:', ':four_leaf_clover:',
                ':maple_leaf:', ':fallen_leaf:', ':leaves:', ':mushroom:', ':tomato:',
                ':eggplant:', ':grapes:', ':melon:', ':watermelon:', ':tangerine:',
                ':lemon:', ':banana:', ':pineapple:', ':apple:', ':green_apple:',
                ':pear:', ':peach:', ':cherries:', ':strawberry:', ':hamburger:',
                ':pizza:', ':meat_on_bone:', ':poultry_leg:', ':rice_cracker:',
                ':rice_ball:', ':rice:', ':curry:', ':ramen:', ':spaghetti:', ':bread:',
                ':fries:', ':sweet_potato:', ':dango:', ':oden:', ':sushi:',
                ':fried_shrimp:', ':fish_cake:', ':icecream:', ':shaved_ice:',
                ':ice_cream:', ':doughnut:', ':cookie:', ':chocolate_bar:', ':candy:',
                ':lollipop:', ':custard:', ':honey_pot:', ':cake:', ':bento:',
                ':stew:', ':egg:', ':fork_and_knife:', ':tea:', ':sake:', ':wine_glass:',
                ':cocktail:', ':tropical_drink:', ':beer:', ':beers:', ':baby_bottle:',
                ':ribbon:', ':gift:', ':birthday:', ':jack_o_lantern:',
                ':christmas_tree:', ':santa:', ':fireworks:', ':sparkler:', ':balloon:',
                ':tada:', ':confetti_ball:', ':tanabata_tree:', ':crossed_flags:',
                ':bamboo:', ':dolls:', ':flags:', ':wind_chime:', ':rice_scene:',
                ':school_satchel:', ':mortar_board:', ':carousel_horse:',
                ':ferris_wheel:', ':roller_coaster:', ':fishing_pole_and_fish:',
                ':microphone:', ':movie_camera:', ':cinema:', ':headphones:', ':art:',
                ':tophat:', ':circus_tent:', ':ticket:', ':clapper:', ':performing_arts:',
                ':video_game:', ':dart:', ':slot_machine:', ':8ball:', ':game_die:',
                ':bowling:', ':flower_playing_cards:', ':musical_note:', ':notes:',
                ':saxophone:', ':guitar:', ':musical_keyboard:', ':trumpet:', ':violin:',
                ':musical_score:', ':running_shirt_with_sash:', ':tennis:', ':ski:',
                ':basketball:', ':checkered_flag:', ':snowboarder:', ':running:',
                ':surfer:', ':trophy:', ':horse_racing:', ':football:', ':rugby_football:',
                ':swimmer:', ':house:', ':house_with_garden:', ':office:', ':post_office:',
                ':european_post_office:', ':hospital:', ':bank:', ':atm:', ':hotel:',
                ':love_hotel:', ':convenience_store:', ':school:', ':department_store:',
                ':factory:', ':lantern:', ':japanese_castle:', ':european_castle:',
                ':rat:', ':mouse2:', ':ox:', ':water_buffalo:', ':cow2:', ':tiger2:',
                ':leopard:', ':rabbit2:', ':cat2:', ':dragon:', ':crocodile:', ':whale2:',
                ':snail:', ':snake:', ':racehorse:', ':ram:', ':goat:', ':sheep:',
                ':monkey:', ':rooster:', ':chicken:', ':dog2:', ':pig2:', ':boar:',
                ':elephant:', ':octopus:', ':shell:', ':bug:', ':ant:', ':honeybee:',
                ':beetle:', ':fish:', ':tropical_fish:', ':blowfish:', ':turtle:',
                ':hatching_chick:', ':baby_chick:', ':hatched_chick:', ':bird:',
                ':penguin:', ':koala:', ':poodle:', ':dromedary_camel:', ':camel:',
                ':dolphin:', ':mouse:', ':cow:', ':tiger:', ':rabbit:', ':cat:',
                ':dragon_face:', ':whale:', ':horse:', ':monkey_face:', ':dog:', ':pig:',
                ':frog:', ':hamster:', ':wolf:', ':bear:', ':panda_face:', ':pig_nose:',
                ':paw_prints:', ':eyes:', ':ear:', ':nose:', ':lips:', ':tongue:',
                ':point_up_2:', ':point_down:', ':point_left:', ':point_right:', ':punch:',
                ':wave:', ':ok_hand:', ':thumbsup:', ':thumbsdown:', ':clap:',
                ':open_hands:', ':crown:', ':womans_hat:', ':eyeglasses:', ':necktie:',
                ':tshirt:', ':jeans:', ':dress:', ':kimono:', ':bikini:',
                ':womans_clothes:', ':purse:', ':handbag:', ':pouch:', ':shoe:',
                ':athletic_shoe:', ':high_heel:', ':sandal:', ':boot:', ':footprints:',
                ':bust_in_silhouette:', ':busts_in_silhouette:', ':boy:', ':girl:', ':man:',
                ':woman:', ':family:', ':couple:', ':two_men_holding_hands:',
                ':two_women_holding_hands:', ':cop:', ':dancers:', ':bride_with_veil:',
                ':person_with_blond_hair:', ':man_with_gua_pi_mao:', ':man_with_turban:',
                ':older_man:', ':older_woman:', ':baby:', ':construction_worker:',
                ':princess:', ':japanese_ogre:', ':japanese_goblin:', ':ghost:', ':angel:',
                ':alien:', ':space_invader:', ':imp:', ':skull:',
                ':information_desk_person:', ':guardsman:', ':dancer:', ':lipstick:',
                ':nail_care:', ':massage:', ':haircut:', ':barber:', ':syringe:', ':pill:',
                ':kiss:', ':love_letter:', ':ring:', ':gem:', ':couplekiss:', ':bouquet:',
                ':couple_with_heart:', ':wedding:', ':heartbeat:', '</3',
                ':two_hearts:', ':sparkling_heart:', ':heartpulse:', ':cupid:',
                ':blue_heart:', ':green_heart:', ':yellow_heart:', ':purple_heart:',
                ':gift_heart:', ':revolving_hearts:', ':heart_decoration:',
                ':diamond_shape_with_a_dot_inside:', ':bulb:', ':anger:', ':bomb:', ':zzz:',
                ':collision:', ':sweat_drops:', ':droplet:', ':dash:', ':shit:', ':muscle:',
                ':dizzy:', ':speech_balloon:', ':thought_balloon:', ':white_flower:',
                ':100:', ':moneybag:', ':currency_exchange:', ':heavy_dollar_sign:',
                ':credit_card:', ':yen:', ':dollar:', ':euro:', ':pound:',
                ':money_with_wings:', ':chart:', ':seat:', ':computer:', ':briefcase:',
                ':minidisc:', ':floppy_disk:', ':cd:', ':dvd:', ':file_folder:',
                ':open_file_folder:', ':page_with_curl:', ':page_facing_up:', ':date:',
                ':calendar:', ':card_index:', ':chart_with_upwards_trend:',
                ':chart_with_downwards_trend:', ':bar_chart:', ':clipboard:', ':pushpin:',
                ':round_pushpin:', ':paperclip:', ':straight_ruler:', ':triangular_ruler:',
                ':bookmark_tabs:', ':ledger:', ':notebook:',
                ':notebook_with_decorative_cover:', ':closed_book:', ':open_book:',
                ':green_book:', ':blue_book:', ':orange_book:', ':books:', ':name_badge:',
                ':scroll:', ':pencil:', ':telephone_receiver:', ':pager:', ':fax:',
                ':satellite:', ':loudspeaker:', ':mega:', ':outbox_tray:', ':inbox_tray:',
                ':package:', ':e-mail:', ':incoming_envelope:', ':envelope_with_arrow:',
                ':mailbox_closed:', ':mailbox:', ':mailbox_with_mail:',
                ':mailbox_with_no_mail:', ':postbox:', ':postal_horn:', ':newspaper:',
                ':iphone:', ':calling:', ':vibration_mode:', ':mobile_phone_off:',
                ':no_mobile_phones:', ':signal_strength:', ':camera:', ':video_camera:',
                ':tv:', ':radio:', ':vhs:', ':twisted_rightwards_arrows:', ':repeat:',
                ':repeat_one:', ':arrows_clockwise:', ':arrows_counterclockwise:',
                ':low_brightness:', ':high_brightness:', ':mute:', ':sound:', ':speaker:',
                ':battery:', ':electric_plug:', ':mag:', ':mag_right:', ':lock_with_ink_pen:',
                ':closed_lock_with_key:', ':key:', ':lock:', ':unlock:', ':bell:',
                ':no_bell:', ':bookmark:', ':link:', ':radio_button:', ':back:', ':end:',
                ':on:', ':soon:', ':top:', ':underage:', ':keycap_ten:', ':capital_abcd:',
                ':abcd:', ':1234:', ':symbols:', ':abc:', ':fire:', ':flashlight:', ':wrench:',
                ':hammer:', ':nut_and_bolt:', ':hocho:', ':gun:', ':microscope:',
                ':telescope:', ':crystal_ball:', ':six_pointed_star:', ':beginner:',
                ':trident:', ':black_square_button:', ':white_square_button:', ':red_circle:',
                ':large_blue_circle:', ':large_orange_diamond:', ':large_blue_diamond:',
                ':small_orange_diamond:', ':small_blue_diamond:', ':small_red_triangle:',
                ':small_red_triangle_down:', ':arrow_up_small:', ':arrow_down_small:',
                ':clock1:', ':clock2:', ':clock3:', ':clock4:', ':clock5:', ':clock6:',
                ':clock7:', ':clock8:', ':clock9:', ':clock10:', ':clock11:', ':clock12:',
                ':clock130:', ':clock230:', ':clock330:', ':clock430:', ':clock530:',
                ':clock630:', ':clock730:', ':clock830:', ':clock930:', ':clock1030:',
                ':clock1130:', ':clock1230:', ':mount_fuji:', ':tokyo_tower:',
                ':statue_of_liberty:', ':japan:', ':moyai:', ':D', ':grin:', ':~)',
                ':)', ':smile:', '~:)', ':satisfied:', 'O:)',
                ':smiling_imp:', ';)', ':blush:', ':yum:', ':relieved:', '<3)',
                'B-)', ':/', ':neutral_face:', ':|', '>:/',
                '~:(', ':pensive:', ':$', 'X$', ':*',
                ':<3', ':kissing_smiling_eyes:', 'X<3',
                ':P', ';P',
                'X-P', ':[', ':worried:', '>:(', ':rage:',
                ':~(', ':persevere:', ':triumph:', ':~[', ':(',
                ':anguished:', ':fearful:', ':weary:', ':sleepy:', 'XC',
                ':#', 'T_T', ':O', ':hushed:', ':cold_sweat:',
                ':scream:', '>XD', '8|', 'Z:|', 'XO', ':no_mouth:',
                ':mask:', ':smile_cat:', ':joy_cat:', ':smiley_cat:', ':heart_eyes_cat:',
                ':smirk_cat:', ':kissing_cat:', ':pouting_cat:', ':crying_cat_face:',
                ':scream_cat:', ':no_good:', ':ok_woman:', ':bow:', ':see_no_evil:',
                ':hear_no_evil:', ':speak_no_evil:', ':raising_hand:', ':raised_hands:',
                ':person_frowning:', ':person_with_pouting_face:', ':pray:', ':rocket:',
                ':helicopter:', ':steam_locomotive:', ':train:', ':bullettrain_side:',
                ':bullettrain_front:', ':train2:', ':metro:', ':light_rail:', ':station:',
                ':tram:', ':bus:', ':oncoming_bus:', ':trolleybus:', ':busstop:',
                ':minibus:', ':ambulance:', ':fire_engine:', ':police_car:',
                ':oncoming_police_car:', ':taxi:', ':oncoming_taxi:', ':red_car:',
                ':oncoming_automobile:', ':blue_car:', ':truck:', ':articulated_lorry:',
                ':tractor:', ':monorail:', ':mountain_railway:', ':suspension_railway:',
                ':mountain_cableway:', ':aerial_tramway:', ':ship:', ':rowboat:',
                ':speedboat:', ':traffic_light:', ':vertical_traffic_light:',
                ':construction:', ':rotating_light:', ':triangular_flag_on_post:', ':door:',
                ':no_entry_sign:', ':smoking:', ':no_smoking:', ':put_litter_in_its_place:',
                ':do_not_litter:', ':potable_water:', ':non-potable_water:', ':bike:',
                ':no_bicycles:', ':bicyclist:', ':mountain_bicyclist:', ':walking:',
                ':no_pedestrians:', ':children_crossing:', ':mens:', ':womens:', ':restroom:',
                ':baby_symbol:', ':toilet:', ':wc:', ':shower:', ':bath:', ':bathtub:',
                ':passport_control:', ':customs:', ':baggage_claim:', ':left_luggage:',
                ':bangbang:', ':interrobang:', ':tm:', ':information_source:',
                ':left_right_arrow:', ':arrow_up_down:', ':arrow_upper_left:',
                ':arrow_upper_right:', ':arrow_lower_right:', ':arrow_lower_left:',
                ':leftwards_arrow_with_hook:', ':arrow_right_hook:', ':watch:', ':hourglass:',
                ':fast_forward:', ':rewind:', ':arrow_double_up:', ':arrow_double_down:',
                ':alarm_clock:', ':hourglass_flowing_sand:', ':m:', ':black_small_square:',
                ':white_small_square:', ':arrow_forward:', ':arrow_backward:',
                ':white_medium_square:', ':black_medium_square:',
                ':white_medium_small_square:', ':black_medium_small_square:', ':sunny:',
                ':cloud:', ':telephone:', ':ballot_box_with_check:', ':umbrella:', ':coffee:',
                ':point_up:', ':relaxed:', ':aries:', ':taurus:', ':gemini:', ':cancer:',
                ':leo:', ':virgo:', ':libra:', ':scorpius:', ':sagittarius:', ':capricorn:',
                ':aquarius:', ':pisces:', ':spades:', ':clubs:', ':hearts:', ':diamonds:',
                ':hotsprings:', ':recycle:', ':wheelchair:', ':anchor:', ':warning:', ':zap:',
                ':white_circle:', ':black_circle:', ':soccer:', ':baseball:', ':snowman:',
                ':partly_sunny:', ':ophiuchus:', ':no_entry:', ':church:', ':fountain:',
                ':golf:', ':sailboat:', ':tent:', ':fuelpump:', ':scissors:',
                ':white_check_mark:', ':airplane:', ':envelope:', ':fist:', ':hand:', ':v:',
                ':pencil2:', ':black_nib:', ':heavy_check_mark:', ':heavy_multiplication_x:',
                ':sparkles:', ':eight_spoked_asterisk:', ':eight_pointed_black_star:',
                ':snowflake:', ':sparkle:', ':x:', ':negative_squared_cross_mark:',
                ':question:', ':grey_question:', ':grey_exclamation:',
                ':heavy_exclamation_mark:', '<3', ':heavy_plus_sign:',
                ':heavy_minus_sign:', ':heavy_division_sign:', ':arrow_right:', ':curly_loop:',
                ':loop:', ':arrow_heading_up:', ':arrow_heading_down:', ':arrow_left:',
                ':arrow_up:', ':arrow_down:', ':black_large_square:', ':white_large_square:',
                ':star:', ':o:', ':wavy_dash:', ':part_alternation_mark:', ':congratulations:',
                ':secret:', ':DX', ':feelsgood:', ':finnadie:', ':goberserk:', ':godmode:',
                ':hurtrealbad:', ':metal:', ':neckbeard:', ':octocat:', ':rage1:', ':rage2:',
                ':rage3:', ':rage4:', ':shipit:', ':squirrel:', ':suspect:', ':trollface:'
            ],
            3: [ // common
                '>:(', '>XD', ':DX', ':$', 'X$',
                ':~(', ':[', ':~[', 'XO', ':|',
                '8|', ':(', ':#', ':D', '<3)',
                'O:)', ':~)', ':*', ':<3', 'X<3',
                'XD', ':O', 'Z:|', ':)', ':/',
                'T_T', ':P', 'X-P', ';P', 'B-)',
                '~:(', '~:)', 'XC', '>:/', ';)',
                '</3', '<3', ':blue_heart:', ':green_heart:', ':yellow_heart:',
                ':purple_heart:', ':kiss:', ':trollface:', ':shit:',
                ':thumbsup:', ':thumbsdown:', ':v:', ':metal:'
            ],
            4: [ // people
                ':DX', ':smile:', 'XD', ':blush:', ':)', ':relaxed:', ':/', '<3)', ':<3',
                'X<3', '8|', ':relieved:', ':satisfied:', ':grin:', ';)', ';P', 'X-P', ':D',
                ':*', ':kissing_smiling_eyes:', ':P', 'Z:|', ':worried:', ':(', ':anguished:',
                ':O', ':#', ':$', ':hushed:', ':|', '>:/', '~:)', '~:(', ':~[', ':weary:',
                ':pensive:', ':[', 'X$', ':fearful:', ':cold_sweat:', ':persevere:', ':~(',
                'T_T', ':~)', '>XD', ':scream:', ':neckbeard:', 'XC', '>:(', ':rage:',
                ':triumph:', ':sleepy:', ':yum:', ':mask:', 'B-)', 'XO', ':imp:',
                ':smiling_imp:', ':neutral_face:', ':no_mouth:', 'O:)', ':alien:',
                ':yellow_heart:', ':blue_heart:', ':purple_heart:', '<3', ':green_heart:',
                '</3', ':heartbeat:', ':heartpulse:', ':two_hearts:', ':revolving_hearts:',
                ':cupid:', ':sparkling_heart:', ':sparkles:', ':star:', ':star2:', ':dizzy:',
                ':boom:', ':collision:', ':anger:', ':exclamation:', ':question:',
                ':grey_exclamation:', ':grey_question:', ':zzz:', ':dash:', ':sweat_drops:',
                ':notes:', ':musical_note:', ':fire:', ':hankey:', ':poop:', ':shit:', ':+1:',
                ':thumbsup:', ':-1:', ':thumbsdown:', ':ok_hand:', ':punch:', ':facepunch:',
                ':fist:', ':v:', ':wave:', ':hand:', ':raised_hand:', ':open_hands:',
                ':point_up:', ':point_down:', ':point_left:', ':point_right:',
                ':raised_hands:', ':pray:', ':point_up_2:', ':clap:', ':muscle:', ':metal:',
                ':walking:', ':runner:', ':running:', ':couple:', ':family:',
                ':two_men_holding_hands:', ':two_women_holding_hands:', ':dancer:',
                ':dancers:', ':ok_woman:', ':no_good:', ':information_desk_person:',
                ':raising_hand:', ':bride_with_veil:', ':person_with_pouting_face:',
                ':person_frowning:', ':bow:', ':couplekiss:', ':couple_with_heart:',
                ':massage:', ':haircut:', ':nail_care:', ':boy:', ':girl:', ':woman:', ':man:',
                ':baby:', ':older_woman:', ':older_man:', ':person_with_blond_hair:',
                ':man_with_gua_pi_mao:', ':man_with_turban:', ':construction_worker:', ':cop:',
                ':angel:', ':princess:', ':smiley_cat:', ':smile_cat:', ':heart_eyes_cat:',
                ':kissing_cat:', ':smirk_cat:', ':scream_cat:', ':crying_cat_face:',
                ':joy_cat:', ':pouting_cat:', ':japanese_ogre:', ':japanese_goblin:',
                ':see_no_evil:', ':hear_no_evil:', ':speak_no_evil:', ':guardsman:', ':skull:',
                ':feet:', ':lips:', ':kiss:', ':droplet:', ':ear:', ':eyes:', ':nose:',
                ':tongue:', ':love_letter:', ':bust_in_silhouette:', ':busts_in_silhouette:',
                ':speech_balloon:', ':thought_balloon:', ':feelsgood:', ':finnadie:',
                ':goberserk:', ':godmode:', ':hurtrealbad:', ':rage1:', ':rage2:', ':rage3:',
                ':rage4:', ':suspect:', ':trollface:'
            ],
            5: [ // nature
                ':sunny:', ':umbrella:', ':cloud:', ':snowflake:', ':snowman:', ':zap:',
                ':cyclone:', ':foggy:', ':ocean:', ':cat:', ':dog:', ':mouse:', ':hamster:',
                ':rabbit:', ':wolf:', ':frog:', ':tiger:', ':koala:', ':bear:', ':pig:',
                ':pig_nose:', ':cow:', ':boar:', ':monkey_face:', ':monkey:', ':horse:',
                ':racehorse:', ':camel:', ':sheep:', ':elephant:', ':panda_face:', ':snake:',
                ':bird:', ':baby_chick:', ':hatched_chick:', ':hatching_chick:', ':chicken:',
                ':penguin:', ':turtle:', ':bug:', ':honeybee:', ':ant:', ':beetle:', ':snail:',
                ':octopus:', ':tropical_fish:', ':fish:', ':whale:', ':whale2:', ':dolphin:',
                ':cow2:', ':ram:', ':rat:', ':water_buffalo:', ':tiger2:', ':rabbit2:',
                ':dragon:', ':goat:', ':rooster:', ':dog2:', ':pig2:', ':mouse2:', ':ox:',
                ':dragon_face:', ':blowfish:', ':crocodile:', ':dromedary_camel:', ':leopard:',
                ':cat2:', ':poodle:', ':paw_prints:', ':bouquet:', ':cherry_blossom:',
                ':tulip:', ':four_leaf_clover:', ':rose:', ':sunflower:', ':hibiscus:',
                ':maple_leaf:', ':leaves:', ':fallen_leaf:', ':herb:', ':mushroom:',
                ':cactus:', ':palm_tree:', ':evergreen_tree:', ':deciduous_tree:',
                ':chestnut:', ':seedling:', ':blossom:', ':ear_of_rice:', ':shell:',
                ':globe_with_meridians:', ':sun_with_face:', ':full_moon_with_face:',
                ':new_moon_with_face:', ':new_moon:', ':waxing_crescent_moon:',
                ':first_quarter_moon:', ':waxing_gibbous_moon:', ':full_moon:',
                ':waning_gibbous_moon:', ':last_quarter_moon:', ':waning_crescent_moon:',
                ':last_quarter_moon_with_face:', ':first_quarter_moon_with_face:', ':moon:',
                ':earth_africa:', ':earth_americas:', ':earth_asia:', ':volcano:',
                ':milky_way:', ':partly_sunny:', ':octocat:', ':squirrel:'
            ],
            6: [ // objects
                ':bamboo:', ':gift_heart:', ':dolls:', ':school_satchel:', ':mortar_board:',
                ':flags:', ':fireworks:', ':sparkler:', ':wind_chime:', ':rice_scene:',
                ':jack_o_lantern:', ':ghost:', ':santa:', ':christmas_tree:', ':gift:',
                ':bell:', ':no_bell:', ':tanabata_tree:', ':tada:', ':confetti_ball:',
                ':balloon:', ':crystal_ball:', ':cd:', ':dvd:', ':floppy_disk:', ':camera:',
                ':video_camera:', ':movie_camera:', ':computer:', ':tv:', ':iphone:',
                ':phone:', ':telephone:', ':telephone_receiver:', ':pager:', ':fax:',
                ':minidisc:', ':vhs:', ':sound:', ':speaker:', ':mute:', ':loudspeaker:',
                ':mega:', ':hourglass:', ':hourglass_flowing_sand:', ':alarm_clock:',
                ':watch:', ':radio:', ':satellite:', ':loop:', ':mag:', ':mag_right:',
                ':unlock:', ':lock:', ':lock_with_ink_pen:', ':closed_lock_with_key:', ':key:',
                ':bulb:', ':flashlight:', ':high_brightness:', ':low_brightness:',
                ':electric_plug:', ':battery:', ':calling:', ':email:', ':mailbox:',
                ':postbox:', ':bath:', ':bathtub:', ':shower:', ':toilet:', ':wrench:',
                ':nut_and_bolt:', ':hammer:', ':seat:', ':moneybag:', ':yen:', ':dollar:',
                ':pound:', ':euro:', ':credit_card:', ':money_with_wings:', ':e-mail:',
                ':inbox_tray:', ':outbox_tray:', ':envelope:', ':incoming_envelope:',
                ':postal_horn:', ':mailbox_closed:', ':mailbox_with_mail:',
                ':mailbox_with_no_mail:', ':door:', ':smoking:', ':bomb:', ':gun:', ':hocho:',
                ':pill:', ':syringe:', ':page_facing_up:', ':page_with_curl:',
                ':bookmark_tabs:', ':bar_chart:', ':chart_with_upwards_trend:',
                ':chart_with_downwards_trend:', ':scroll:', ':clipboard:', ':calendar:',
                ':date:', ':card_index:', ':file_folder:', ':open_file_folder:', ':scissors:',
                ':pushpin:', ':paperclip:', ':black_nib:', ':pencil2:', ':straight_ruler:',
                ':triangular_ruler:', ':closed_book:', ':green_book:', ':blue_book:',
                ':orange_book:', ':notebook:', ':notebook_with_decorative_cover:', ':ledger:',
                ':books:', ':bookmark:', ':name_badge:', ':microscope:', ':telescope:',
                ':newspaper:', ':football:', ':basketball:', ':soccer:', ':baseball:',
                ':tennis:', ':8ball:', ':rugby_football:', ':bowling:', ':golf:',
                ':mountain_bicyclist:', ':bicyclist:', ':horse_racing:', ':snowboarder:',
                ':swimmer:', ':surfer:', ':ski:', ':spades:', ':hearts:', ':clubs:',
                ':diamonds:', ':gem:', ':ring:', ':trophy:', ':musical_score:',
                ':musical_keyboard:', ':violin:', ':space_invader:', ':video_game:',
                ':black_joker:', ':flower_playing_cards:', ':game_die:', ':dart:', ':mahjong:',
                ':clapper:', ':memo:', ':pencil:', ':book:', ':art:', ':microphone:',
                ':headphones:', ':trumpet:', ':saxophone:', ':guitar:', ':shoe:', ':sandal:',
                ':high_heel:', ':lipstick:', ':boot:', ':shirt:', ':tshirt:', ':necktie:',
                ':womans_clothes:', ':dress:', ':running_shirt_with_sash:', ':jeans:',
                ':kimono:', ':bikini:', ':ribbon:', ':tophat:', ':crown:', ':womans_hat:',
                ':mans_shoe:', ':closed_umbrella:', ':briefcase:', ':handbag:', ':pouch:',
                ':purse:', ':eyeglasses:', ':fishing_pole_and_fish:', ':coffee:', ':tea:',
                ':sake:', ':baby_bottle:', ':beer:', ':beers:', ':cocktail:',
                ':tropical_drink:', ':wine_glass:', ':fork_and_knife:', ':pizza:',
                ':hamburger:', ':fries:', ':poultry_leg:', ':meat_on_bone:', ':spaghetti:',
                ':curry:', ':fried_shrimp:', ':bento:', ':sushi:', ':fish_cake:',
                ':rice_ball:', ':rice_cracker:', ':rice:', ':ramen:', ':stew:', ':oden:',
                ':dango:', ':egg:', ':bread:', ':doughnut:', ':custard:', ':icecream:',
                ':ice_cream:', ':shaved_ice:', ':birthday:', ':cake:', ':cookie:',
                ':chocolate_bar:', ':candy:', ':lollipop:', ':honey_pot:', ':apple:',
                ':green_apple:', ':tangerine:', ':lemon:', ':cherries:', ':grapes:',
                ':watermelon:', ':strawberry:', ':peach:', ':melon:', ':banana:', ':pear:',
                ':pineapple:', ':sweet_potato:', ':eggplant:', ':tomato:', ':corn:'
            ],
            7: [ // places
                ':house:', ':house_with_garden:', ':school:', ':office:', ':post_office:',
                ':hospital:', ':bank:', ':convenience_store:', ':love_hotel:', ':hotel:',
                ':wedding:', ':church:', ':department_store:', ':european_post_office:',
                ':city_sunrise:', ':city_sunset:', ':japanese_castle:', ':european_castle:',
                ':tent:', ':factory:', ':tokyo_tower:', ':japan:', ':mount_fuji:',
                ':sunrise_over_mountains:', ':sunrise:', ':stars:', ':statue_of_liberty:',
                ':bridge_at_night:', ':carousel_horse:', ':rainbow:', ':ferris_wheel:',
                ':fountain:', ':roller_coaster:', ':ship:', ':speedboat:', ':boat:',
                ':sailboat:', ':rowboat:', ':anchor:', ':rocket:', ':airplane:',
                ':helicopter:', ':steam_locomotive:', ':tram:', ':mountain_railway:', ':bike:',
                ':aerial_tramway:', ':suspension_railway:', ':mountain_cableway:', ':tractor:',
                ':blue_car:', ':oncoming_automobile:', ':car:', ':red_car:', ':taxi:',
                ':oncoming_taxi:', ':articulated_lorry:', ':bus:', ':oncoming_bus:',
                ':rotating_light:', ':police_car:', ':oncoming_police_car:', ':fire_engine:',
                ':ambulance:', ':minibus:', ':truck:', ':train:', ':station:', ':train2:',
                ':bullettrain_front:', ':bullettrain_side:', ':light_rail:', ':monorail:',
                ':railway_car:', ':trolleybus:', ':ticket:', ':fuelpump:',
                ':vertical_traffic_light:', ':traffic_light:', ':warning:', ':construction:',
                ':beginner:', ':atm:', ':slot_machine:', ':busstop:', ':barber:',
                ':hotsprings:', ':checkered_flag:', ':crossed_flags:', ':izakaya_lantern:',
                ':moyai:', ':circus_tent:', ':performing_arts:', ':round_pushpin:',
                ':triangular_flag_on_post:', ':jp:', ':kr:', ':cn:', ':us:', ':fr:', ':es:',
                ':it:', ':ru:', ':gb:', ':uk:', ':de:'
            ],
            8: [ // symbols
                ':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:',
                ':nine:', ':keycap_ten:', ':1234:', ':zero:', ':hash:', ':symbols:',
                ':arrow_backward:', ':arrow_down:', ':arrow_forward:', ':arrow_left:',
                ':capital_abcd:', ':abcd:', ':abc:', ':arrow_lower_left:',
                ':arrow_lower_right:', ':arrow_right:', ':arrow_up:', ':arrow_upper_left:',
                ':arrow_upper_right:', ':arrow_double_down:', ':arrow_double_up:',
                ':arrow_down_small:', ':arrow_heading_down:', ':arrow_heading_up:',
                ':leftwards_arrow_with_hook:', ':arrow_right_hook:', ':left_right_arrow:',
                ':arrow_up_down:', ':arrow_up_small:', ':arrows_clockwise:',
                ':arrows_counterclockwise:', ':rewind:', ':fast_forward:',
                ':information_source:', ':ok:', ':twisted_rightwards_arrows:', ':repeat:',
                ':repeat_one:', ':new:', ':top:', ':up:', ':cool:', ':free:', ':ng:',
                ':cinema:', ':koko:', ':signal_strength:', ':u5272:', ':u5408:', ':u55b6:',
                ':u6307:', ':u6708:', ':u6709:', ':u6e80:', ':u7121:', ':u7533:', ':u7a7a:',
                ':u7981:', ':sa:', ':restroom:', ':mens:', ':womens:', ':baby_symbol:',
                ':no_smoking:', ':parking:', ':wheelchair:', ':metro:', ':baggage_claim:',
                ':accept:', ':wc:', ':potable_water:', ':put_litter_in_its_place:', ':secret:',
                ':congratulations:', ':m:', ':passport_control:', ':left_luggage:',
                ':customs:', ':ideograph_advantage:', ':cl:', ':sos:', ':id:',
                ':no_entry_sign:', ':underage:', ':no_mobile_phones:', ':do_not_litter:',
                ':non-potable_water:', ':no_bicycles:', ':no_pedestrians:',
                ':children_crossing:', ':no_entry:', ':eight_spoked_asterisk:',
                ':eight_pointed_black_star:', ':heart_decoration:', ':vs:', ':vibration_mode:',
                ':mobile_phone_off:', ':chart:', ':currency_exchange:', ':aries:', ':taurus:',
                ':gemini:', ':cancer:', ':leo:', ':virgo:', ':libra:', ':scorpius:',
                ':sagittarius:', ':capricorn:', ':aquarius:', ':pisces:', ':ophiuchus:',
                ':six_pointed_star:', ':negative_squared_cross_mark:', ':a:', ':b:', ':ab:',
                ':o2:', ':diamond_shape_with_a_dot_inside:', ':recycle:', ':end:', ':on:',
                ':soon:', ':clock1:', ':clock130:', ':clock10:', ':clock1030:', ':clock11:',
                ':clock1130:', ':clock12:', ':clock1230:', ':clock2:', ':clock230:',
                ':clock3:', ':clock330:', ':clock4:', ':clock430:', ':clock5:', ':clock530:',
                ':clock6:', ':clock630:', ':clock7:', ':clock730:', ':clock8:', ':clock830:',
                ':clock9:', ':clock930:', ':heavy_dollar_sign:', ':copyright:', ':registered:',
                ':tm:', ':x:', ':heavy_exclamation_mark:', ':bangbang:', ':interrobang:',
                ':o:', ':heavy_multiplication_x:', ':heavy_plus_sign:', ':heavy_minus_sign:',
                ':heavy_division_sign:', ':white_flower:', ':100:', ':heavy_check_mark:',
                ':ballot_box_with_check:', ':radio_button:', ':link:', ':curly_loop:',
                ':wavy_dash:', ':part_alternation_mark:', ':trident:', ':white_check_mark:',
                ':black_square_button:', ':white_square_button:', ':black_circle:',
                ':white_circle:', ':red_circle:', ':large_blue_circle:',
                ':large_blue_diamond:', ':large_orange_diamond:', ':small_blue_diamond:',
                ':small_orange_diamond:', ':small_red_triangle:', ':small_red_triangle_down:',
                ':shipit:'
            ]
        };

        // init functions
        this.initUI();
    },
    /* Initialize UI and precache html
     */
    initUI: function() {
        var _this = this;
        // dialog header & body
        var dialogHeader = $('<div/>', {
            'class': 'dialog-header'
        });
        var dialogBody = $('<div/>', {
            'class': 'dialog-body'
        }).css({
            height: '252px'
        });
        // panels
        var panelLeft = $('<div/>', {
            id: 'dialog-emoticons-panelLeft'
        }).css({
            position: 'absolute',
            left: '0',
            width: '140px',
            height: '100%',
            'overflow-x': 'hidden',
            'overflow-y': 'auto',
            background: 'black'
        });
        var panelLeftUl = $('<ul/>', {
        }).css({
            'list-style-type': 'none',
            padding: '0 0 160px 0',
            margin: '0'
        });
        var panelSepLine = $('<div/>', {
        }).css({
            position: 'absolute',
            left: '140px',
            width: '1px',
            height: '100%',
            'background-color': '#444'
        });
        var panelRight = $('<div/>', {
            id: 'dialog-emoticons-panelRight'
        }).css({
            position: 'absolute',
            left: '141px',
            width: '216px',
            height: '100%',
            'overflow-x': 'hidden',
            'overflow-y': 'auto',
            background: '#808080'
        });
        var panelRightUl = $('<ul/>', {
        }).css({
            'list-style-type': 'none',
            margin: '10px auto 0 auto',
            padding: '0 0 200px 0',
            width: '184px',
            overflow: 'hidden'
        });
        // main dialog
        var dialogEmoticons = $('<div/>', {
            id: 'dialog-emoticons',
            'class': 'dialog'
        }).css({
            'z-index': '100',
            position: 'absolute',
            width: '357px',
            height: '290px'
        });
        // left items
        var leftItems = '';


        // populate items
        $.each(this.tabs, function(index, value) {
            // left
            var leftHtml = '<li class="emoticons-tab"> \
                                <span class="menu-playlist-item-label">' + value.name + '</span> \
                                <span class="menu-playlist-item-label menu-playlist-item-count">' +
                                    (value.index >= 0 ? _this.emo[value.index].length : '0') +
                                    ' items' + '</span> \
                            </li>';
            leftItems += leftHtml;
        });

        // inject styles - emoticons-tab
        injectStyles('.emoticons-tab { \
                        position: relative; \
                        width: 100%; \
                        height: 35px; \
                        cursor: pointer; \
                    }');
        injectStyles('.emoticons-tab .menu-playlist-item-label { \
                        left: 12px; \
                        top: 4px; \
                    }');
        injectStyles('.emoticons-tab .menu-playlist-item-count { \
                        top: 20px; \
                    }');
        // inject styles - right panel li
        injectStyles('#dialog-emoticons-panelRight ul li { \
                        display: inline-block; \
                        margin: 1px; \
                        float: left; \
                        width:' + (this.BLOCK_WIDTH * this.SPRITE_SCALE) + 'px; \
                        height:' + (this.BLOCK_HEIGHT * this.SPRITE_SCALE) + 'px; \
                        overflow: hidden; \
                        cursor: pointer; \
                    }');
        injectStyles('#dialog-emoticons-panelRight ul li .emoji { \
                        width:' + (this.BLOCK_WIDTH * this.SPRITE_SCALE) + 'px; \
                        height:' + (this.BLOCK_HEIGHT * this.SPRITE_SCALE) + 'px; \
                        background-size:' +
                            (this.SPRITE_WIDTH * this.SPRITE_SCALE) + 'px ' +
                            (this.SPRITE_HEIGHT * this.SPRITE_SCALE) + 'px; \
                    }');

        // append left items to left panel
        panelLeftUl.html(leftItems);

        // append obj to dialog body
        panelLeftUl.appendTo(panelLeft);
        panelLeft.appendTo(dialogBody);
        panelSepLine.appendTo(dialogBody);
        panelRightUl.appendTo(panelRight);
        panelRight.appendTo(dialogBody);

        // append obj to dialog
        dialogHeader.html(  '<div class="dialog-header"> \
                                <p style=" \
                                    position: absolute; \
                                    left: 115px; \
                                    top: 0px; \
                                    color: lightsteelblue \
                                ">CTRL + Click to add continuously</p> \
                                <span>Emoticons</span> \
                                <div class="dialog-close-button"></div> \
                                <div class="dialog-header-line"></div> \
                            </div>');
        dialogHeader.appendTo(dialogEmoticons);
        dialogBody.appendTo(dialogEmoticons);

        // store
        this.dialog = dialogEmoticons;
    },
    /* Get new block <li/>
     * \param   text    |   emoticons text ex. ':smiley:'
     */
    getNewBlock: function(text) {
        var block = $('<li/>', {
            title: ''
        });
        var blockInnerHtml = Emoji.emojify(Utils.cleanTypedString(text));
        var spanEmoji;

        // set title
        block.prop('title', text);
        // set html to inner block
        block.html(blockInnerHtml);

        // get deepest span
        spanEmoji = block.children('.emoji-glow').children('span');

        // check non-existed emoticon
        if (0 === spanEmoji.length) {
            console.log('Non-existed emoji detected: ' + text);
            return null;
        }

        // init spanEmoji
        this.initSpanEmoji(spanEmoji);

        return block;
    },
    /* Init spanEmoji
     */
    initSpanEmoji: function(spanEmoji) {
        var spanEmojiClone;
        var splitOfs, ofs_x, ofs_y;

        // set background-position
        spanEmojiClone = spanEmoji.clone();
        $('body').append(spanEmojiClone);
        splitOfs = spanEmojiClone.css('background-position').split(' ');
        ofs_x = parseInt(splitOfs[0].substr(0, splitOfs[0].length - 2));
        ofs_y = parseInt(splitOfs[1].substr(0, splitOfs[1].length - 2));
        spanEmoji.css('background-position', (ofs_x * this.SPRITE_SCALE) + 'px ' +
                                            (ofs_y * this.SPRITE_SCALE) + 'px');
        spanEmojiClone.remove();

    },
    /* Init handlers 1 - show button click
     */
    initHandlers1: function() {
        $('#emoji-button').click($.proxy(this.onShowButtonClick, this));
    },
    /* Init handlers 2 - on dialog
     */
    initHandlers2: function() {
        if (this.hasInitHandlers2) { return; }

        var _this = this;

        $('#dialog-emoticons .dialog-close-button').live('click', $.proxy(this.onCloseButtonClick, this));

        $('#dialog-emoticons').live('mouseover', $.proxy(this.onMouseOverDialog, this));
        $('#dialog-emoticons').live('mouseout', $.proxy(this.onMouseOutDialog, this));
        $('body').live('mouseout', $.proxy(this.onMouseOutDialog, this));

        $('.emoticons-tab').live('click', function(event) {
            if ( !event.handled) {
                // update tab
                var index = $(this).index();
                _this.updateTab(index);
            }
            return false;
        });
        $('#dialog-emoticons-panelRight ul li').live('mouseenter', function() {
            if ( !event.handled) {
                $(this).css('background', 'white');

                event.handled = true;
            }
            return false;
        });
        $('#dialog-emoticons-panelRight ul li').live('mouseleave', function() {
            if ( !event.handled) {
                $(this).css('background', '');

                event.handled = true;
            }
            return false;
        });
        $('#dialog-emoticons-panelRight ul li').live('click', function(event) {
            if ( !event.handled) {
                _this.insertChat( $(this).prop('title') );

                !_this.conti &&
                    _this.close();

                event.handled = true;
            }
            return false;
        });

        this.hasInitHandlers2 = true;
    },
    /* Init handlers 3 - scroll
     */
    initHandlers3: function() {
        $('#dialog-emoticons-panelLeft').off('scroll', $.proxy(this.onPanelLeftScroll, this))
                                        .on('scroll', $.proxy(this.onPanelLeftScroll, this));
        $('#dialog-emoticons-panelRight').off('scroll', $.proxy(this.onPanelRightScroll, this))
                                        .on('scroll', $.proxy(this.onPanelRightScroll, this));
    },
    /* Show UI
     */
    show: function() {
        // remove old elements
        $('#dialog-emoticons').remove();

        // append to body
        this.dialog.appendTo( $('body') );

        // update selected tab
        this.updateTab(this.currentTab);

        // re-pos
        this.repos();

        // restore left panel scrollTop
        this.preventScroll = true;
        if (this.scrollTop['left']) {
            $('#dialog-emoticons-panelLeft').scrollTop(this.scrollTop['left']);
        } else {
            $('#dialog-emoticons-panelLeft').scrollTop(0);
        }
        this.preventScroll = false;

        // init handlers
        this.initHandlers2();
        this.initHandlers3();

        this.visible = true;
    },
    /* Close UI
     */
    close: function() {
        // remove emoticons dialog
        $('#dialog-emoticons').remove();
        // focus input field
        $('#chat-input-field').focus();

        this.visible = false;
    },
    /* Re-position
     */
    repos: function() {
        // re-pos emoticons dialog
        if ('block' === $('#button-chat-expand').css('display')) {
            // show at bottom
            $('#dialog-emoticons').css({
                top: $('#emoji-button').offset().top + 26,
                left: $('#emoji-button').offset().left - $('#dialog-emoticons').width() + 32
            });
        } else {
            // show at top
            $('#dialog-emoticons').css({
                top: $('#emoji-button').offset().top - $('#dialog-emoticons').height() - 10,
                left: $('#emoji-button').offset().left - $('#dialog-emoticons').width() + 32
            });
        }
    },
    /* Update selected tab
     * \param   index   |   index of tab
     */
    updateTab: function(index) {
        var _this = this;

        $('.emoticons-tab:lt(' + index + ')').removeClass('menu-playlist-item-selected');
        $('.emoticons-tab').eq(index).addClass('menu-playlist-item-selected');
        $('.emoticons-tab:gt(' + index + ')').removeClass('menu-playlist-item-selected');

        // check to populate right items
        if ('undefined' === typeof(this.rightItems[index])) {
            var rightHtml = '';
            $.each(this.emo[index], function(index2, value2) {
                var block = _this.getNewBlock(value2);

                // append html
                rightHtml += block[0].outerHTML;
            });

            // pre-cache
            this.rightItems[index] = rightHtml;
        }

        // show emoticons
        $('#dialog-emoticons-panelRight ul').html(this.rightItems[index]);

        // restore scrollTop
        this.preventScroll = true;
        if (this.scrollTop[index]) {
            $('#dialog-emoticons-panelRight').scrollTop(this.scrollTop[index]);
        } else { // undefined
            $('#dialog-emoticons-panelRight').scrollTop(0);
        }
        this.preventScroll = false;

        // store index
        this.currentTab = index;
    },
    /* Update right panel only
     */
    updateRightPanel: function(index) {
        // show emoticons
        (index >= 0) &&
            $('#dialog-emoticons-panelRight ul').html(this.rightItems[index]);
    },
    /* Add recent item from my message
     * \param   text    |   emoticons text ex. ':smiley:'
     * \param   index   |   index of tab
     */
    addRecentItem: function(text, index) {
        // replace text into Emoji._cons
        text = this.replaceCons(text);

        // check if text is already in items
        if (true === this.recentItems[index][text]) { return };

        var rightPanel = $('<ul/>', {});
        var block = this.getNewBlock(text);

        // check block
        if (null === block) { return; }

        // set html
        rightPanel.html(this.rightItems[index]);

        // check max amount
        (rightPanel.children('li').length + 1 > this.MAX_RECENT[index]) &&
            ( rightPanel.children('li:last()').remove(), this.recentItems[index][text] = false );

        // prepend block
        block.prependTo(rightPanel);

        // store item
        this.recentItems[index][text] = true;

        // store html
        this.rightItems[index] = rightPanel.html();

        // update tab subtitle
        this.dialog.find('.emoticons-tab')
            .eq(index)
            .children('.menu-playlist-item-count')
            .text(rightPanel.children('li').length + ' items');

        // update panel if it's activated
        (this.currentTab === index) &&
            this.updateRightPanel(index);
    },
    /* Replace emoticons text into Emoji._cons
     */
    replaceCons: function(text) {
        $.each(Emoji._cons, function(key, value) {
            if (text === ':' + value + ':') {
                text = key;
                return text;
            }
        });
        return text;
    },
    /* Insert emoticons text into chat
     * \param   insertText  |   text to insert
     */
    insertChat: function(insertText) {
        var inputBox = $('#chat-input-field'),
            cursorStart = inputBox.prop('selectionStart'),
            cursorEnd = inputBox.prop('selectionEnd'),
            v = inputBox.val(),
            textBefore = v.substring(0,  cursorStart),
            textAfter  = v.substring(cursorEnd, v.length),
            addeSpaceBefore = 0,
            addeSpaceAfter = 0;

        // insert space
        (textBefore.length > 0) &&
            (' ' !== textBefore[textBefore.length - 1]) &&
            (textBefore += ' ', addeSpaceBefore = 1);
        (' ' !== textAfter[0]) &&
            (textAfter = ' ' + textAfter, addeSpaceAfter = 1);

        // concatenate
        inputBox.val(textBefore + insertText + textAfter);
        inputBox.prop('selectionStart', cursorStart + addeSpaceBefore + addeSpaceAfter + insertText.length);
        inputBox.prop('selectionEnd', cursorStart + addeSpaceBefore + addeSpaceAfter + insertText.length);
    },
    /* Set chat text
     * \param   text    |   text to set
     */
    setChat: function(text) {
        $('#chat-input-field').val(text)
                            .prop('selectionStart', text.length);
    },
    /* Switch auto-hide, for debug
     */
    switchAutoHide: function(en) {
        this.autoHide = en;
    },
    /* When emoticons button is clicked
     */
    onShowButtonClick: function() {
        this.show();
    },
    /* When close button is clicked
     */
    onCloseButtonClick: function() {
        this.close();
    },
    /* When mouse is over dialog, reset fading timeout
     */
    onMouseOverDialog: function() {
        clearTimeout(this.timeout_fadeDialog);
    },
    /* When mouse is out of dialog, start fading
     */
    onMouseOutDialog: function(event) {
        if ( !this.autoHide) { return; }
        if ( !this.visible) { return; }

        var dialog = $('#dialog-emoticons');
        var l = dialog.offset().left,
            t = dialog.offset().top,
            w = dialog.width(),
            h = dialog.height();

        // check position
        if (event.pageX >= l &&
            event.pageX <= l + w &&
            event.pageY >= t &&
            event.pageY <= t + h) { return; }

        // set timeout
        this.timeout_fadeDialog = setTimeout(
            $.proxy(this.onTimeoutFadeDialog, this),
            this.TIMEOUT_FADEDiALOG);
    },
    /* When scrolling in left panel
     */
    onPanelLeftScroll: function() {
        if (this.preventScroll) { return; }

        this.scrollTop['left'] = $('#dialog-emoticons-panelLeft').scrollTop();
    },
    /* When scrolling in right panel
     */
    onPanelRightScroll: function() {
        if (this.preventScroll) { return; }

        this.scrollTop[this.currentTab] = $('#dialog-emoticons-panelRight').scrollTop();
    },
    /* When fading timeout expired
     */
    onTimeoutFadeDialog: function() {
        clearTimeout(this.timeout_fadeDialog);
        this.close();
    },
    /* When receiving chat message
     * \param   a   |   an object (code snippet copied from plug.dj)
     */
    onChatReceived: function(a) {
        var _this = this;
        var user = a.from,
            myName = API.getSelf().username;

        a = a.message;

        // record message sent by my
        if (user === myName) {
            if (_this.historyMessage.length + 1 > _this.MAX_HISTORYChAT) { _this.historyMessage.shift(); }
            _this.historyMessage.push( a.replace(/&lt;/g, '<')
                                        .replace(/&gt;/g, '>')
                                        .replace(/&amp;/g, '&') ); // record history
        }

        // record emoticons
        for (var c in Emoji._cons)
            var d = c, e = Emoji._cons[c], d = d.replace("<", "&lt;").replace(">", "&gt;"), d = RegExp("(\\s|^)(" + Emoji._regexEscape(d) + ")(?=\\s|$)", "g"), a = a.replace(d, "$1:" + e + ":");
        for (c = Emoji._matchStr.exec(a); c; ) {
            if (user === myName) { // me
                _this.addRecentItem(c[0], _this.TAB_RECENTMe);
            } else { // other users
                _this.addRecentItem(c[0], _this.TAB_RECENTUsERS);
            }

            // next time
            a = a.substr(0, c.index) + d + a.substr(c.index + c[0].length);
            c = Emoji._matchStr.exec(a);
        }
    },
    /* When keydown on body
     */
    onBodyKeydown: function(event) {
        (this.KEYCODE_CONTI === event.which) &&
            (this.conti = true);
        // esc -> focus chat box
        (this.KEYCODE_ESC === event.which) &&
            ( $('#chat-input-field').focus() );
    },
    /* When keyup on body
     */
    onBodyKeyup: function(event) {
        (this.KEYCODE_CONTI === event.which) &&
            (this.conti = false);
    },
    /* When keydown on chat-input
     */
    onChatInputKeydown: function(event) {
        if (this.KEYCODE_ESC === event.which) { // esc -> delete all text
            this.setChat('');
            return;
        }

        var input = $('#chat-input-field');

        if (this.historyConti) { // continuously search history messages
            if (this.KEYCODE_ARROWUp === event.which) { // up
                this.historyIndex -= 1;
                if (-1 !== this.historyIndex) {
                    event.preventDefault();
                    this.setChat(this.historyMessage[this.historyIndex]);
                } else {
                    this.historyIndex = 0;
                }
            } else if (this.KEYCODE_ARROWDoWN === event.which) { // down
                this.historyIndex += 1;
                if (this.historyIndex < this.historyMessage.length) {
                    event.preventDefault();
                    this.setChat(this.historyMessage[this.historyIndex]);
                } else {
                    this.historyIndex = this.historyMessage.length - 1;
                }
            } else { // other keys
                this.historyConti = false;
            }
        } else { // init searching
            if (this.KEYCODE_ARROWUp === event.which &&
                '' === input.val()) {
                this.historyIndex = this.historyMessage.length - 1;
                if (-1 !== this.historyIndex) {
                    event.preventDefault();
                    this.setChat(this.historyMessage[this.historyIndex]);
                    this.historyConti = true;
                }
            }
        }
    }
});


/*
 * NOTE:  This is 100% procedural because I can't see a reason to add classes, etc.
 *
 * @author  Conner Davis (Fruity Loops)
 */
/* ###
 * Whether the user has currently enabled auto-woot/auto-meh
 */
var autowoot;
var automeh = false;
/*
 * Whether the user has currently enabled auto-queueing.
 */
var autoqueue;
/*
 * Whether or not the user has enabled hiding this video.
 */
var hideVideo;
/* ###
 * Whether or not the user has enabled the userlist.
 */
var userList;
var timeout_updateUserList; // timeout delay to update user-list
var time_lastUpdateUserList = 0; // last time of updating user-list
var INTERVAL_UPDATEUsERLiST = 3000; // interval to update user-list, msec
/*
 * Whether the current video was skipped or not.
 */
var skippingVideo = false;
/* ###
 * Hide video temporarily, set to true when user clicks SKIP VIDEO but not hiding video
 */
var hideVideoTemp = false;
/* ###
 * Current playing video url
 */
var vidURL = '';
/* ###
 * Emoticons view
 */
var EmojiUIView = new EmojiUI();
/* ###
 * Original animation speed
 */
var oriAnimSpeed = 0;
/* ###
 * Is webpage visible
 */
var isWebVisible = true;

/*
 * Cookie constants
 */
var COOKIE_WOOT = 'autowoot';
var COOKIE_QUEUE = 'autoqueue';
var COOKIE_HIDE_VIDEO = 'hidevideo';
var COOKIE_USERLIST = 'userlist';

/*
 * Maximum amount of people that can be in the waitlist.
 */
var MAX_USERS_WAITLIST = 50;

/**
 * Initialise all of the Plug.dj API listeners which we use
 * to asynchronously intercept specific events and the data
 * attached with them.
 */
function initAPIListeners()
{
    /*
     * This listens in for whenever a new DJ starts playing.
     */
    API.addEventListener(API.DJ_ADVANCE, djAdvanced);

    /*
     * This listens for changes in the waiting list
     */
    API.addEventListener(API.WAIT_LIST_UPDATE, queueUpdate);

    /*
     * This listens for changes in the dj booth
     */
    API.addEventListener(API.DJ_UPDATE, queueUpdate);

    /*
     * This listens for whenever a user in the room either WOOT!s
     * or Mehs the current song.
     */
    API.addEventListener(API.VOTE_UPDATE, function (obj)
    {
        if (userList)
        {
            populateUserlist();
        }
    });

    /*
     * Whenever a user joins, this listener is called.
     */
    API.addEventListener(API.USER_JOIN, function (user)
    {
        if (userList)
        {
            populateUserlist();
        }
    });

    /*
     * Called upon a user exiting the room.
     */
    API.addEventListener(API.USER_LEAVE, function (user)
    {
        if (userList)
        {
            populateUserlist();
        }
    });

    /* ###
     * Called upon receiving a message
     */
    API.addEventListener(API.CHAT, $.proxy(EmojiUIView.onChatReceived, EmojiUIView));
}


/**
 * Renders all of the Plug.bot "UI" that is visible beneath the video
 * player.
 */
function displayUI()
{
    /*
     * Be sure to remove any old instance of the UI, in case the user
     * reloads the script without refreshing the page (updating.)
     */
    $('#plugbot-ui').remove();

    /*
     * Generate the HTML code for the UI.
     */
    $('#chat').prepend('<div id="plugbot-ui"></div>');

    var cWoot = autowoot ? '#3FFF00' : '#ED1C24';
    var cMeh = automeh ? '#3FFF00' : '#ED1C24'; // ### auto-meh
    var cQueue = autoqueue ? '#3FFF00' : '#ED1C24';
    var cHideVideo = hideVideo ? '#3FFF00' : '#ED1C24';
    var cUserList = userList ? '#3FFF00' : '#ED1C24';

    // ###
    $('#plugbot-ui').append(
        '<p id="plugbot-btn-woot" style="color:' + cWoot +
        '">auto-woot</p><p id="plugbot-btn-meh" style="color:' + cMeh +
        '">auto-meh</p><p id="plugbot-btn-queue" style="color:' + cQueue +
        '">auto-queue</p><p id="plugbot-btn-hidevideo" style="color:' + cHideVideo +
        '">hide video</p><p id="plugbot-btn-skipvideo" style="color:#ED1C24">skip video</p><p id="plugbot-btn-userlist" style="color:' + cUserList + '">userlist</p>' +
        '<p><a href="' + vidURL + '" target="_blank" id="plugbot-btn-openvid" style="color:#FFF">open video link</a></p>');
}

/** ###
 * \brief   Display emoticons
 */
function displayEmoticons() {
    // chat fields
    var chatInput = $('.chat-input');
    var chatInputField = $('#chat-input-field');
    var dialogBox = $('#dialog-box');

    // emoticons buttons (div -> span)
    var emoticonsButton_smile = $('<span/>', {
        'class': 'emoji emoji-1f603'
    }).css({
        margin: '3px 0 0 3px'
    });
    var emoticonsButton = $('<div/>', {
        id: 'emoji-button',
        title: 'Insert Emoticons'
    }).css({
        position: 'absolute',
        width: '22',
        height: '24',
        right: '0',
        cursor: 'pointer'
    });


    // remove old elements
    $('#emoji-button').remove();

    // set chat field style
    chatInputField.css('width', '267px');

    // append emoticons button to input field
    emoticonsButton_smile.appendTo(emoticonsButton)
    emoticonsButton.appendTo(chatInput);

    // bind handler to EmojiUI
    EmojiUIView.initHandlers1();
}

/** ###
 * For every button on the Plug.bot UI, we have listeners backing them
 * that are built to intercept the user's clicking each button.  Based
 * on the button that they clicked, we can execute some logic that will
 * in some way affect their experience.
 */
function initUIListeners()
{
    /* ###
     * Windows resize event
     */
    $(window).resize(function() {
        EmojiUIView.repos();
    });

    /* ###
     * Body key down/up
     */
    $("body").keydown( $.proxy(EmojiUIView.onBodyKeydown, EmojiUIView) )
            .keyup( $.proxy(EmojiUIView.onBodyKeyup, EmojiUIView) );

    /* ###
     * Chat-input key down: restore history chat
     */
    $("#chat-input-field").keydown( $.proxy(EmojiUIView.onChatInputKeydown, EmojiUIView) );

    /* ###
     * Chat expands/collapses
     */
    $('#button-chat-expand').click(function() {
        EmojiUIView.repos();
    });
    $('#button-chat-collapse').click(function() {
        EmojiUIView.repos();
    });

    /*
     * Toggle userlist.
     */
    $('#plugbot-btn-userlist').live("click", function() // ### .live()
    {
        userList = !userList;
        $(this).css('color', userList ? '#3FFF00' : '#ED1C24');
        $('#plugbot-userlist').css('visibility', userList ? 'visible' : 'hidden');

        if (!userList)
        {
            $('#plugbot-userlist').empty();
        }
        else
        {
            populateUserlist();
        }
        jaaulde.utils.cookies.set(COOKIE_USERLIST, userList);
    });

    /* ###
     * Toggle auto-woot.
     */
    $('#plugbot-btn-woot').live('click', function() // ### .live()
    {
        autowoot = !autowoot;
        (autowoot) &&
            (automeh = false);

        $(this).css('color', autowoot ? '#3FFF00' : '#ED1C24');
        $('#plugbot-btn-meh').css('color', automeh ? '#3FFF00' : '#ED1C24');

        if (autowoot) {
            $('#button-vote-positive').click();
        }

        jaaulde.utils.cookies.set(COOKIE_WOOT, autowoot);
    });

    /* ###
     * Toggle auto-meh.
     */
    $('#plugbot-btn-meh').live('click', function() // ### .live()
    {
        automeh = !automeh;
        (automeh) &&
            (autowoot = false);

        $(this).css('color', automeh ? '#3FFF00' : '#ED1C24');
        $('#plugbot-btn-woot').css('color', autowoot ? '#3FFF00' : '#ED1C24');

        if (automeh) {
            $('#button-vote-negative').click();
        }
    });

    /*
     * Toggle hide video.
     */
    $('#plugbot-btn-hidevideo').live('click', function() // ### .live()
    {
        hideVideo = !hideVideo;
        $(this).css('color', hideVideo ? '#3FFF00' : '#ED1C24');
        $(this).text(hideVideo ? 'hiding video' : 'hide video');
        $('#yt-frame').animate(
        {
            'height': (hideVideo ? '0px' : '271px')
        },
        {
            duration: 'fast'
        });
        $('#playback .frame-background').animate(
        {
            'opacity': (hideVideo ? '0' : '0.91')
        },
        {
            duration: 'medium'
        });
        jaaulde.utils.cookies.set(COOKIE_HIDE_VIDEO, hideVideo);
    });

    /* ###
     * Skip current video.
     */
    $('#plugbot-btn-skipvideo').live('click', function() // ### .live()
    {
        skippingVideo = !skippingVideo;
        $(this).css('color', skippingVideo ? '#3FFF00' : '#ED1C24');
        $(this).text(skippingVideo ? 'skipping video' : 'skip video');

        // switch sound mute/on
        var soundOn = (0 !== $('#slider > div').width());
        if (soundOn === skippingVideo) {
            $('#button-sound').click();
        }

        // hide video
        var intervalCheckResumeSound = null;
        if (skippingVideo) {
            if (!hideVideoTemp && !hideVideo) { // hide vid
                $('#plugbot-btn-hidevideo').click();
            }

            hideVideoTemp = true;
        } else {
            if (hideVideoTemp && hideVideo) { // show vid
                $('#plugbot-btn-hidevideo').click();
            }

            clearInterval(intervalCheckResumeSound);

            hideVideoTemp = false;
        }

    });

    /*
     * Toggle auto-queue/auto-DJ.
     */
    $('#plugbot-btn-queue').live('click', function() // ### .live()
    {
        autoqueue = !autoqueue;
        $(this).css('color', autoqueue ? '#3FFF00' : '#ED1C24');

        if (autoqueue && !isInQueue())
        {
            joinQueue();
        }
        jaaulde.utils.cookies.set(COOKIE_QUEUE, autoqueue);
    });

    /* ###
     * Show user box
     */
    $('.plugbot-userlist-user').live('click', function() { // ### .live()
        var pos = $(this).position();
        var user = $(this).text();
        var user_id = 0;

        for (var i = 0; i < Models.room.data.users.length; ++i) {
            if (Models.room.data.users[i].username === user) {
                user_id = Models.room.data.users[i].id;
                break;
            }
        }

        var user_obj = Models.room.userHash[user_id] || Models.room.nirUserHash[user_id];
        RoomUser.rollover.showChat(user_obj, pos.left + 300, pos.top);
    });

    // ### Init visibility watch
    init_visWatch();
}

/** ###
 * Called whenever a new DJ begins playing in the room.
 *
 * @param obj
 *              This contains the current DJ's data.
 */
function djAdvanced(obj)
{
    /*
     * If they want the video to be hidden, be sure to re-hide it.
     * ### but don't hide if user clicks SKIP VIDEO previously
     */
    if (hideVideo &&
        !skippingVideo)
    {
        $('#yt-frame').css('height', '0px');
        $('#playback .frame-background').css('opacity', '.0');
    }

    if (skippingVideo)
    {
        // resume label
        $('#plugbot-btn-skipvideo').css('color', '#ED1C24').text('skip video');

        // show vid
        if (hideVideoTemp && hideVideo) {
            $('#plugbot-btn-hidevideo').click();
        }

        // resume sound
        forceResumeVolume();
        resetPlayback();

        skippingVideo = false;
        hideVideoTemp = false;
    }

    /* ###
     * If auto-woot is enabled, WOOT! the song.
     * otherwise, MEH! the song
     */
    if (autowoot) { // WOOT
        $('#button-vote-positive').click();
    } else if (automeh) { // MEH
        $('#button-vote-negative').click();
    }

    /*
     * If the userlist is enabled, re-populate it.
     */
    if (userList)
    {
        populateUserlist();
    }

    // ### update vid url
    updateVidURL(false);
}

/**
 * Called whenever a change happens to the queue.
 */
function queueUpdate()
{
    /*
     * If auto-queueing has been enabled, and we are currently
     * not in the waitlist, then try to join the list.
     */
    if (autoqueue && !isInQueue())
    {
        joinQueue();
    }
}

/**
 * Checks whether or not the user is already in queue.
 *
 * @return True if the user is in queue, else false.
 */
function isInQueue()
{
    var self = API.getSelf();
    return API.getWaitList().indexOf(self) !== -1 || API.getDJs().indexOf(self) !== -1;
}

/**
 * Tries to add the user to the queue or the booth if there is no queue.
 *
 */
function joinQueue()
{
    if ($('#button-dj-play').css('display') === 'block')
    {
        $('#button-dj-play').click();
    }
    else if (API.getWaitList().length < MAX_USERS_WAITLIST)
    {
        API.waitListJoin();
    }
}

/** ###
 * Generates every user in the room and their current vote as
 * colour-coded text.  Also, moderators get the star next to
 * their name.
 */
function populateUserlist()
{
    // check if page is visible
    if ( !isWebVisible) { return; }

    // limit rate
    var dateNow = new Date();
    var tickNow = dateNow.getTime();
    dateNow = null;

    clearTimeout(timeout_updateUserList);
    if (tickNow - time_lastUpdateUserList >= INTERVAL_UPDATEUsERLiST) {
        time_lastUpdateUserList = tickNow;
    } else {
        timeout_updateUserList = setTimeout(function() {
            populateUserlist();
        }, INTERVAL_UPDATEUsERLiST);
        return;
    }

    var userList = $('#plugbot-userlist');
    var users = API.getUsers();
    /*
     * Destroy the old userlist DIV and replace it with a fresh
     * empty one to work with.
     */
    userList.html(' ')
            .append('<h1 style="text-indent:12px;color:#42A5DC;font-size:14px;font-variant:small-caps;">Users: ' + users.length + '</h1>')
            .append('<p style="padding-left:12px;text-indent:0px !important;font-style:italic;color:#42A5DC;font-size:11px;">Click a username to<br />open user-box!</p><br />');

    /*
     * If the user is in the waitlist, show them their current spot.
     */
    if ($('#button-dj-waitlist-view').prop('title') !== '')
    {
        if ($('#button-dj-waitlist-leave').css('display') === 'block' &&
            ($.inArray(API.getDJs(), API.getSelf()) == -1)) {
            var spot = $('#button-dj-waitlist-view').prop('title').split('(')[1];
            spot = spot.substring(0, spot.indexOf(')'));
            userList.append('<h1 id="plugbot-queuespot"><span style="font-variant:small-caps">Waitlist:</span> ' + spot + '</h1><br />');
        }
    }

    /*
     * Populate the users array with the next user
     * in the room (this is stored alphabetically.)
     */
    $.each(users, function(index, key) {
        appendUser(key);
    });
}

/**
 * Appends another user's username to the userlist.
 *
 * @param username
 *              The username of this user.
 * @param vote
 *              Their current 'vote', which may be:
 *                  -1  : Meh
 *                  0   : 'undecided' (hasn't voted yet)
 *                  1   : WOOT!
 */
function appendUser(user)
{
    var username = user.username;
    /*
     * A new feature to Pepper, which is a permission value,
     * may be 1-5 afaik.
     *
     * 1: normal (or 0)
     * 2: bouncer
     * 3: manager
     * 4/5: (co-)host
     */
    var permission = user.permission;

    /*
     * If they're an admin, set them as a fake permission,
     * makes it easier.
     */
    if (user.admin)
    {
        permission = 99;
    }

    /*
     * For special users, we put a picture of their rank
     * (the star) before their name, and colour it based
     * on their vote.
     */
    var imagePrefix;
    switch (permission)
    {
        case 0:
            imagePrefix = 'normal';
            break;
        case 1:
            imagePrefix = 'featured';
            break;
        case 2:
            imagePrefix = 'bouncer';
            break;
        case 3:
            imagePrefix = 'manager';
            break;
        case 4:
        case 5:
            imagePrefix = 'host';
            break;
        case 99:
            imagePrefix = 'admin';
            break;
    }

    /*
     * If they're the current DJ, override their rank
     * and show a different colour, a shade of blue,
     * to denote that they're playing right now (since
     * they can't vote their own song.)
     */
    if (0 !== API.getDJs().length) { // ###
        if (API.getDJs()[0].username == username)
        {
            if (imagePrefix === 'normal')
            {
                drawUserlistItem('void', '#42A5DC', username);
            }
            else
            {
                drawUserlistItem(imagePrefix + '_current.png', '#42A5DC', username);
            }
        }
        else if (imagePrefix === 'normal')
        {
            /*
             * If they're a normal user, they have no special icon.
             */
            drawUserlistItem('void', colorByVote(user.vote), username);
        }
        else
        {
            /*
             * Otherwise, they're ranked and they aren't playing,
             * so draw the image next to them.
             */
            drawUserlistItem(imagePrefix + imagePrefixByVote(user.vote), colorByVote(user.vote), username);
        }
    }
}

/**
 * Determine the color of a person's username in the
 * userlist based on their current vote.
 *
 * @param vote
 *              Their vote: woot, undecided or meh.
 */
function colorByVote(vote)
{
    if (!vote)
    {
        return '#fff'; // blame Boycey
    }
    switch (vote)
    {
        case -1:    // Meh
            return '#c8303d';
        case 0: // Undecided
            return '#fff';
        case 1: // Woot
            return '#c2e320';
    }
}

/**
 * Determine the "image prefix", or a picture that
 * shows up next to each user applicable in the userlist.
 * This denotes their rank, and its color is changed
 * based on that user's vote.
 *
 * @param vote
 *              Their current vote.
 * @returns
 *              The varying path to the PNG image for this user,
 *              as a string.  NOTE:  this only provides the suffix
 *              of the path.. the prefix of the path, which is
 *              admin_, host_, etc. is done inside {@link #appendUser(user)}.
 */
function imagePrefixByVote(vote)
{
    if (!vote)
    {
        return '_undecided.png'; // blame boycey again
    }
    switch (vote)
    {
        case -1:
            return '_meh.png';
        case 0:
            return '_undecided.png';
        case 1:
            return '_woot.png';
    }
}

/**
 * Draw a user in the userlist.
 *
 * @param imagePath
 *              An image prefixed by their username denoting
 *              rank; bouncer/manager/etc. 'void' for normal users.
 * @param color
 *              Their color in the userlist, based on vote.
 * @param username
 *              Their username.
 */
function drawUserlistItem(imagePath, color, username)
{
    /*
     * If they aren't a normal user, draw their rank icon.
     */
    if (imagePath !== 'void')
    {
        var realPath = 'http://www.theedmbasement.com/basebot/userlist/' + imagePath;
        $('#plugbot-userlist').append('<img src="' + realPath + '" align="left" style="margin-left:6px;margin-top:2px" />');
    }

    /* ###
     * Write the HTML code to the userlist.
     */
    $('#plugbot-userlist').append(
        '<p class="plugbot-userlist-user" style="cursor:pointer;' + (imagePath === 'void' ? '' : 'text-indent:6px !important;') + 'color:' + color + ';' + ((API.getDJs()[0].username == username) ? 'font-size:15px;font-weight:bold;' : '') + '" >' + username + '</p>');
}


///////////////////////////////////////////////////////////
////////// EVERYTHING FROM HERE ON OUT IS INIT ////////////
///////////////////////////////////////////////////////////

/*
 * Clear the old code so we can properly update everything.
 */
$('#plugbot-userlist').remove();
$('#plugbot-css').remove();
$('#plugbot-js').remove();


/*
 * Include cookie library
 *
 * TODO Replace with equivalent jQuery, I'm sure it's less work than this
 */
var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'http://cookies.googlecode.com/svn/trunk/jaaulde.cookies.js';
script.onreadystatechange = function()
{
    if (this.readyState == 'complete')
    {
        readCookies();
    }
}
script.onload = readCookies;
head.appendChild(script);


/**
 * Read cookies when the library is loaded.
 */
function readCookies()
{
    /*
     * Changing default cookie settings
     */
    var currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() + 1); //Cookies expire after 1 year
    var newOptions =
    {
        expiresAt: currentDate
    }
    jaaulde.utils.cookies.setOptions(newOptions);

    /*
     * Read Auto-Woot cookie (true by default)
     */
    var value = jaaulde.utils.cookies.get(COOKIE_WOOT);
    autowoot = value != null ? value : true;

    /*
     * Read Auto-Queue cookie (false by default)
     */
    value = jaaulde.utils.cookies.get(COOKIE_QUEUE);
    autoqueue = value != null ? value : false;

    /*
     * Read hidevideo cookie (false by default)
     */
    value = jaaulde.utils.cookies.get(COOKIE_HIDE_VIDEO);
    hideVideo = value != null ? value : false;

    /*
     * Read userlist cookie (true by default)
     */
    value = jaaulde.utils.cookies.get(COOKIE_USERLIST);
    userList = value != null ? value : true;

    onCookiesLoaded();
}


/*
 * Write the CSS rules that are used for components of the
 * Plug.bot UI.
 */
$('body').prepend('<style type="text/css" id="plugbot-css">#plugbot-ui { position: absolute; margin-left: 349px; }#plugbot-ui p { background-color: #0b0b0b; height: 32px; padding-top: 8px; padding-left: 8px; padding-right: 6px; cursor: pointer; font-variant: small-caps; width: 84px; font-size: 15px; margin: 0; }#plugbot-ui h2 { background-color: #0b0b0b; height: 112px; width: 156px; margin: 0; color: #fff; font-size: 13px; font-variant: small-caps; padding: 8px 0 0 12px; border-top: 1px dotted #292929; }#plugbot-userlist { border: 6px solid rgba(10, 10, 10, 0.8); border-left: 0 !important; background-color: #000000; padding: 8px 0px 20px 0px; width: 12%; }#plugbot-userlist p { margin: 0; padding-top: 4px; text-indent: 24px; font-size: 10px; }#plugbot-userlist p:first-child { padding-top: 0px !important; }#plugbot-queuespot { color: #42A5DC; text-align: left; font-size: 15px; margin-left: 8px }');
$('body').append('<div id="plugbot-userlist"></div>');


/**
 * Continue initialization after user's settings are loaded
 */
function onCookiesLoaded()
{
    /* ###
     * Hit the woot button, if autowoot is enabled.
     * Hit the meh button if disabled
     */
    if (autowoot) {
        $('#button-vote-positive').click();
    } else if (automeh) {
        $('#button-vote-negative').click();
    }

    /*
     * Auto-queue, if autoqueue is enabled and the list is not full yet.
     */

    if (autoqueue && !isInQueue())
    {
        joinQueue();
    }

    /*
     * Hide video, if hideVideo is enabled.
     */
    if (hideVideo)
    {
        $('#yt-frame').animate(
        {
            'height': (hideVideo ? '0px' : '271px')
        },
        {
            duration: 'fast'
        });
        $('#playback .frame-background').animate(
        {
            'opacity': (hideVideo ? '0' : '0.91')
        },
        {
            duration: 'medium'
        });
    }

    /*
     * Generate userlist, if userList is enabled.
     */
    if (userList)
    {
        populateUserlist();
    }

    /*
     * Call all init-related functions to start the software up.
     */
    updateVidURL(true); // ### update video url
    suppressAlert(); // ### suppress alert function

    initAPIListeners();
    displayUI();
    initUIListeners();

    displayEmoticons(); // ### display emoticons
}

/* Update video orignal url
 * \param   noDisplay       |   don't call displayUI()
 */
function updateVidURL(noDisplay) {
    if ('undefined' === typeof(Playback.media)) { return; }

    if ('1' === Playback.media.format) { // youtube
        vidURL = 'http://www.youtube.com/watch?v=' + Playback.media.cid;
    } else if ('2' === Playback.media.format) { // soundcloud
        vidURL = 'http://www.soundcloud.com/';
    }

    if ( !noDisplay) {
        displayUI();
    }
}

/* Suppress alert box
 */
function suppressAlert() {
    window.alert = function(text) {
        console.log('ALERT: ' + text);
    }
}

/* Force resume volume
 */
function forceResumeVolume() {
    // resume sound
    if (0 !== $('#slider > div').width()) { $('#button-sound').click(); }
    if (0 === $('#slider > div').width()) { $('#button-sound').click(); }
    Playback.setVolume(Playback.volume);
}

/* Reset playback
 */
function resetPlayback() {
    Playback.play(Playback.media,Playback.mediaStartTime);
}

/* Inject css styles
 */
function injectStyles(rule) {
    $('head').append('<style type="text/css">' + rule + '</style>');
}

/* Init webpage visibility watch
 */
function init_visWatch() {
    var hidden = "hidden";

    // Standards:
    if (hidden in document)
        document.addEventListener("visibilitychange", onchange);
    else if ((hidden = "mozHidden") in document)
        document.addEventListener("mozvisibilitychange", onchange);
    else if ((hidden = "webkitHidden") in document)
        document.addEventListener("webkitvisibilitychange", onchange);
    else if ((hidden = "msHidden") in document)
        document.addEventListener("msvisibilitychange", onchange);

    // IE 9 and lower:
    else if ('onfocusin' in document)
        document.onfocusin = document.onfocusout = onchange;

    // All others:
    else
        window.onfocus = window.onblur = onchange;

    function onchange(evt) {
        var isvis = true;
        evt = evt || window.event;

        if (evt.type == "focus" || evt.type == "focusin") {
            isvis = true;
        } else if (evt.type == "blur" || evt.type == "focusout") {
            isvis = false;
        } else {
            isvis = !this[hidden];
        }

        if (isvis) {
            onWindowFocus();
        } else {
            onWindowBlur();
        }
    }
}

/* When window is focused
 */
function onWindowFocus() {
    (0 !== oriAnimSpeed) &&
        (animSpeed = oriAnimSpeed, isWebVisible = true);
}

/* When window is NOT focused
 */
function onWindowBlur() {
    oriAnimSpeed = animSpeed;
    animSpeed = 1e100;
    isWebVisible = false;
}

#include "plug-dj.hpp"

int main() {
    // input files
    std::fstream fsCss(INPUT_CSS, std::fstream::in);
    std::fstream fsJs(INPUT_JS, std::fstream::in);
    // output files
    std::fstream fsResult(OUTPUT_RESULT, std::fstream::out);

    using pos2d = std::tuple<int, int>;
    // (x, y) => css
    // span.emoji-0023{background-position:0 0}
    std::map<pos2d, string> pos2css;
    // css => name
    // apple:"1f34e"
    std::map<string, string> css2name;
    // name => smiley
    // ":)":"smiley"
    std::map<string, string> name2smiley;
    // result
    size_t numResult = 0;


    // delete output files
    remove(OUTPUT_RESULT);

    // extract css
    {
        char c;
        string bufStr;

        bool matched = false;

        while (fsCss.get(c)) {
            // append char to buffer
            bufStr += c;

            // analyze and reset buffer when reaching right bracket
            if ('}' == c) {
                boost::match_results<string::const_iterator> match;
                string::const_iterator bufBegin = bufStr.begin(),
                                        bufEnd = bufStr.end();

                // parse info
                matched = false;
                while (boost::regex_search(bufBegin, bufEnd,
                                            match, regexCss)) {
                    pos2css[pos2d{stoi(match["pos-x"]),
                                stoi(match["pos-y"])}
                            ] = match["css"];

                    bufBegin = match[0].second;
                    matched = true;

                    if (bufBegin >= bufEnd) { break; }
                }

                // check correctness
                if (boost::regex_match(bufStr, match, regexCssCheck) &&
                    !matched) {
                    cerr << "Text: " << bufStr << endl;
                    cerr << "Regex: " << regexCssCheck << endl;
                    cerr << "Failed to parse text. Check regex." << endl;
                    PAUSE();
                }

                // reset buffer
                bufStr = "";
            }
        }

        // close file
        fsCss.close();
    }

    // extract js
    {
        char c;
        string buf;

        // search string
        const std::map<string, string> searchStr{
            {"first", "define(\"app/utils/Emoji\","},
            {"smiley", "n={"},
            {"css", "r={"}
        };

        // state info
        enum class stateInfo {
            first,
            smiley,
            inSmiley,
            css,
            inCss
        };

        // current state
        stateInfo state = stateInfo::first;

        auto searchPart = [&buf, &searchStr] (string key) {
            size_t sz1 = buf.size(),
                    sz2 = searchStr.at(key).size();

            if (sz1 > sz2) {
                size_t diff = sz1 - sz2;
                buf = buf.substr(diff, buf.size() - diff);
            }

            if (searchStr.at(key) == buf) {
                buf = "";
                return true;
            }

            return false;
        };

        while (fsJs.get(c)) {
            buf += c;

            switch (state) {
            case stateInfo::first: {
                if (searchPart("first")) {
                    state = stateInfo::smiley;
                }
            } break;
            case stateInfo::smiley: {
                if (searchPart("smiley")) {
                    state = stateInfo::inSmiley;
                }
            } break;
            case stateInfo::inSmiley: {
                if ('}' == fsJs.peek()) {
                    // extract smiley map
                    boost::match_results<string::const_iterator> match;
                    string::const_iterator bufBegin = buf.begin(),
                                            bufEnd = buf.end();

                    while (boost::regex_search(bufBegin, bufEnd,
                                                match, regexSmileyMap)) {
                        name2smiley[ match["item"] ] = match["key"];

                        // check correctness
                        if (match[0].second - bufBegin - 1 >
                            match[0].length()) {
                            cerr << "Text: " << match[0] << endl;
                            cerr << "Regex: " << regexSmileyMap << endl;
                            cerr << "Failed to parse text. Check regex."
                                << endl;
                            PAUSE();
                        }

                        bufBegin = match[0].second;
                        if (bufBegin >= bufEnd) { break; }
                    }

                    state = stateInfo::css;
                }
            } break;
            case stateInfo::css: {
                if (searchPart("css")) {
                    state = stateInfo::inCss;
                }
            } break;
            case stateInfo::inCss: {
                if ('}' == fsJs.peek()) {
                    // extract css map
                    boost::match_results<string::const_iterator> match;
                    string::const_iterator bufBegin = buf.begin(),
                                            bufEnd = buf.end();

                    while (boost::regex_search(bufBegin, bufEnd,
                                                match, regexCssMap)) {
                        css2name[ match["item"] ] = match["key"];

                        // check correctness
                        if (match[0].second - bufBegin - 1 >
                            match[0].length()) {

                            cerr << "Text: " << match[0] << endl;
                            cerr << "Regex: " << regexCssMap << endl;
                            cerr << "Failed to parse text. Check regex."
                                << endl;
                            PAUSE();
                        }

                        bufBegin = match[0].second;
                        if (bufBegin >= bufEnd) { break; }
                    }

                    goto jump_extractJs_finish;
                }
            } break;
            }
        }
jump_extractJs_finish:
        // close file
        fsJs.close();
    }

    // generate result
    {
        plugbot::formatter formatter(fsResult, MAX_WIDTH, ", ", "\n");
        bool first = true;

        for (int x=0; x!=CSS_W_END; x+=CSS_W) {
            for (int y=0; y!=CSS_H_END; y+=CSS_H) {
                auto itCss = pos2css.find(pos2d{-x, -y});

                if (itCss != pos2css.end()) {
                    string name = css2name.at(itCss->second);
                    auto itSmiley = name2smiley.find(name);

                    if (itSmiley != name2smiley.end()) {
                        name = itSmiley->second;
                    }

                    // seperator
                    if (first) {
                        first = false;
                    } else {
                        formatter << ", ";
                    }

                    // item
                    formatter << "'" << name << "'";

                    ++numResult;
                }
            }
        }

        // close custom formatter
        formatter.close();

        // close file
        fsResult.close();
    }

    // show result
    cout << numResult << " items generated." << endl
        << "Done!" << endl;

    return 0;
}

int stoi(const string &str) {
    int ret = 0;
    int sign = 1;

    string::const_iterator start = str.begin(),
        end = str.end();

    if ('-' == *start) { sign = -1; ++start; }
    do {
        ret *= 10;
        ret += ((*start) - '0');
    } while (++start != end);

    return (1 == sign ? ret : -ret);
}

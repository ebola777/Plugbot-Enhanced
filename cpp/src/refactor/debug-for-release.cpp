#include "debug-for-release.hpp"

int main() {
    std::fstream fsDebug(INPUT_DEBUG, std::fstream::in);
    std::fstream fsRelease(INPUT_RELEASE, std::fstream::in);
    std::fstream fsResult(OUTPUT_RELEASE, std::fstream::out);

    // buffer
    string buf;

    // state info
    enum class stateInfo {
        searching,
        script
    };

    // state
    stateInfo state;
    string currentId;

    // context
    std::map<string, string> context;

    // result
    size_t numResult = 0;

    auto searchPart = [&buf] (const string &str) {
        size_t sz1 = buf.size(),
                sz2 = str.size();

        if (sz1 >= sz2) {
            size_t diff = sz1 - sz2;

            if (buf.substr(diff, sz2) == str) {
                return true;
            }
        }

        return false;
    };

    // read context from debug file
    {
        char c;

        state = stateInfo::searching;
        buf = "";

        while (fsDebug.get(c)) {
            buf += c;

            switch (state) {
            case stateInfo::searching: {
                for (auto p: searchStr) {
                    string str = searchStr.at(p.first);

                    if (searchPart(str)) {
                        currentId = p.first;

                        buf = "";

                        state = stateInfo::script;
                        break;
                    }
                }
            } break;
            case stateInfo::script: {
                string str = searchStrEnd.at(currentId);

                if (searchPart(str)) {
                    context[currentId] = buf;
                    buf = "";
                    state = stateInfo::searching;
                }
            } break;
            }
        }

        // close file
        fsDebug.close();
    }

    // read old context from release file
    {
        char c;

        state = stateInfo::searching;
        buf = "";

        while (fsRelease.get(c)) {
            buf += c;

            switch (state) {
            case stateInfo::searching: {
                for (auto p: searchStr) {
                    string str = searchStr.at(p.first);

                    if (searchPart(str)) {
                        currentId = p.first;

                        fsResult << buf;
                        buf = "";

                        state = stateInfo::script;
                        break;
                    }
                }
            } break;
            case stateInfo::script: {
                string str = searchStrEnd.at(currentId);

                if (searchPart(str)) {
                    fsResult << context.at(currentId);
                    buf = "";

                    state = stateInfo::searching;

                    ++numResult;
                }
            } break;
            }
        }

        // output remaining string from buffer
        fsResult << buf;

        // close file
        fsRelease.close();
        fsResult.close();
    }

    // show result
    cout << numResult << " result generated." << endl
        << "Done!" << endl;

    return 0;
}

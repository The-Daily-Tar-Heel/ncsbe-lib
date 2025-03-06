/**
 * Represents a candidate and their vote count.
 */
export interface CandidateData {
    /** Candidate's name. */
    candidate: string;

    /** Candidate's political party. */
    party: string;

    /** Number of votes received. */
    votes: number;
}

/**
 * Represents a precinct and the candidates who received votes there. Holds CandidateData.
 */
export interface PrecinctData {
    /** Precinct identifier. */
    precinct: string;

    /** List of candidates who received votes in this precinct. */
    candidates: CandidateData[];
}

/**
 * Represents a county and its election results by precinct. Holds PrecinctData -> CandidateData.
 */
export interface CountyData {
    /** County name (e.g., "Orange", "Wake"). */
    county: string;

    /** List of precincts within the county. */
    precincts: PrecinctData[];
}

/**
 * Represents an election contest (race) and its results across counties. Top of the hierarchy that holds CountyData -> PrecinctData -> CandidateDate.
 */
export interface ContestData {
    /** The name of the contest (e.g., "US Senate"). */
    contestName: string;

    /** List of counties where voting took place for this contest. */
    counties: CountyData[];

    candidates: CandidateData[];
}

/**
 * Represents a single row of parsed election data from the TSV file.
 */
export interface ParsedRow {
    /** County name (e.g., "Wake", "Mecklenburg"). */
    county: string;

    /** Election date in YYYY-MM-DD format. */
    electionDate: string;

    /** Precinct identifier within the county. */
    precinct: string;

    /** Unique ID for the contest group (race). */
    contestGroupId: number;

    /** Type of contest (e.g., "F", "S", "C", "L", "M"). */
    contestType: string;

    /** Name of the contest (e.g., "US Senate"). */
    contestName: string;

    /** Name of the candidate. */
    choice: string;

    /** Political party of the candidate (e.g., "DEM", "REP"). */
    choiceParty: string;

    /** Number of votes the candidate could receive (e.g., 1 for single-choice races). */
    voteFor: number;

    /** Votes cast on election day. */
    electionDay: number;

    /** Votes cast during early voting. */
    earlyVoting: number;

    /** Votes cast via absentee by mail. */
    absenteeByMail: number;

    /** Votes cast provisionally (pending verification). */
    provisional: number;

    /** Total votes received by the candidate in this precinct. */
    totalVotes: number;

    /** Whether the precinct is real (true) or aggregated (false). */
    realPrecinct: boolean;
}

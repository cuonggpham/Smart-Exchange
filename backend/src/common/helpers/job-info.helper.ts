export class JobInfoHelper {
    private static readonly SEPARATOR = ":::";
    private static readonly MAX_COMBINED_LENGTH = 400;

    /**
     * Format career and position into jobTitle string
     * @param career - Career information
     * @param position - Position information
     * @returns Formatted jobTitle string
     */
    static formatJobTitle(career?: string, position?: string): string {
        const careerStr = (career || "").trim();
        const positionStr = (position || "").trim();
        return `${careerStr}${this.SEPARATOR}${positionStr}`;
    }

    /**
     * Parse jobTitle string into career and position
     * @param jobTitle - The jobTitle string to parse
     * @returns Object containing career and position
     */
    static parseJobTitle(jobTitle?: string | null): { career: string; position: string } {
        if (!jobTitle) {
            return { career: "", position: "" };
        }

        const parts = jobTitle.split(this.SEPARATOR);
        return {
            career: (parts[0] || "").trim(),
            position: (parts[1] || "").trim(),
        };
    }

    /**
     * Validate jobTitle format and length
     * @param jobTitle - The jobTitle to validate
     * @returns true if valid, false otherwise
     */
    static validateJobTitle(jobTitle: string): boolean {
        if (!jobTitle || jobTitle.length === 0) {
            return true; // Empty is valid
        }

        // Check total length
        if (jobTitle.length > this.MAX_COMBINED_LENGTH) {
            return false;
        }

        // Check if contains separator
        if (!jobTitle.includes(this.SEPARATOR)) {
            return false;
        }

        return true;
    }

    /**
     * Validate and format career and position
     * @param career - Career information
     * @param position - Position information
     * @returns Validated and formatted jobTitle
     * @throws Error if validation fails
     */
    static validateAndFormat(career?: string, position?: string): string {
        const careerStr = (career || "").trim();
        const positionStr = (position || "").trim();

        const formatted = this.formatJobTitle(careerStr, positionStr);

        if (formatted.length > this.MAX_COMBINED_LENGTH) {
            throw new Error(
                `Combined career and position length must not exceed ${this.MAX_COMBINED_LENGTH} characters`
            );
        }

        return formatted;
    }
}

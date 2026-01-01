import React from "react";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, ...inputProps }) => {
    return (
        <div className="form-group">
            <label>{label}</label>
            <input {...inputProps} />
        </div>
    );
};

export default TextInput;

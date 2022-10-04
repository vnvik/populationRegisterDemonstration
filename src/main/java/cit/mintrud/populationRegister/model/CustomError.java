package cit.mintrud.populationRegister.model;


import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CustomError {
   private Integer error;
   private String message;

    public CustomError(int error, String message) {
        this.error = error;
        this.message = message;
    }
}
